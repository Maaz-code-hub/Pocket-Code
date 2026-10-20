// Supabase Storage backend (REST API, no SDK).
// Paths are arrays of names, stored as object keys "a/b/file.txt" in one bucket.
// Supabase has no real folders, so an empty folder is kept by a hidden ".keep" object.
const { Readable } = require('node:stream');
const { httpError, limitStream, KEEP, isReserved } = require('./util');

// Supabase only accepts a limited set of characters in object keys. Anything
// else (unicode, #, %, [, ! …) is stored as "!xx" hex bytes and decoded on read.
const SAFE = /[A-Za-z0-9_\-. ()'&$@=;:+,]/;
const encodeName = (name) => [...name].map(ch => SAFE.test(ch) ? ch
  : Buffer.from(ch).toString('hex').replace(/../g, '!$&')).join('');
const decodeName = (key) => key.replace(/(?:![0-9a-f]{2})+/gi, m => Buffer.from(m.replace(/!/g, ''), 'hex').toString());

module.exports = function supabaseBackend({ url, key, bucket }) {
  const base = `${url.replace(/\/+$/, '')}/storage/v1`;
  // Legacy service_role keys are JWTs and go in Authorization too; new
  // sb_secret_ keys only go in the apikey header.
  const authHeaders = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
  const toKey = (parts) => parts.map(encodeName).join('/');
  const toUrlPath = (parts) => parts.map(n => encodeURIComponent(encodeName(n))).join('/');

  async function call(method, path, { body, headers = {}, json, raw = false, duplex } = {}) {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: { ...authHeaders, ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : body,
      ...(duplex ? { duplex } : {}),
    });
    if (raw && res.ok) return res;
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || `Supabase error ${res.status}`;
      const status = Number(data?.statusCode) || res.status;
      if (status === 409 || /duplicate|already exists/i.test(msg)) throw httpError(409, 'File already exists');
      if (status === 404 || /not found/i.test(msg)) throw httpError(404, 'Not found');
      if (status === 413 || /maximum allowed size|too large/i.test(msg)) throw httpError(413, 'File too large for your Supabase plan');
      const err = new Error(`Supabase: ${msg}`); err.status = 502; throw err;
    }
    return data;
  }

  // Raw direct children, all pages. Entries with id == null are sub-folders.
  async function children(parts) {
    const prefix = parts.length ? `${toKey(parts)}/` : '';
    const out = [];
    for (let offset = 0; ; offset += 1000) {
      const page = await call('POST', `/object/list/${bucket}`, {
        json: { prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } },
      });
      out.push(...page);
      if (page.length < 1000) return out;
    }
  }

  const timeOf = (o) => Date.parse(o.updated_at || o.created_at) || 0;

  // Every object key under a folder, at any depth (including .keep markers).
  async function allKeys(parts) {
    const keys = [];
    for (const o of await children(parts)) {
      if (o.id) keys.push(`${toKey(parts)}/${o.name}`);
      else keys.push(...await allKeys([...parts, decodeName(o.name)]));
    }
    return keys;
  }

  async function upload(parts, body, { overwrite, length, contentType = 'application/octet-stream' }) {
    await call('POST', `/object/${bucket}/${toUrlPath(parts)}`, {
      body,
      duplex: 'half',
      headers: {
        'Content-Type': contentType,
        'x-upsert': overwrite ? 'true' : 'false',
        ...(length ? { 'Content-Length': String(length) } : {}),
      },
    });
  }

  const moveKey = (from, to) =>
    call('POST', '/object/move', { json: { bucketId: bucket, sourceKey: from, destinationKey: to } });

  async function removeKeys(keys) {
    for (let i = 0; i < keys.length; i += 1000) {
      await call('DELETE', `/object/${bucket}`, { json: { prefixes: keys.slice(i, i + 1000) } });
    }
  }

  async function entryIn(parts) {
    if (!parts.length) return null;
    const name = encodeName(parts.at(-1));
    return (await children(parts.slice(0, -1))).find(o => o.name === name) || null;
  }

  return {
    name: `Supabase bucket "${bucket}"`,

    // Make sure the bucket exists (private). Safe to call on every start.
    async init() {
      try {
        await call('POST', '/bucket', { json: { id: bucket, name: bucket, public: false } });
        console.log(`Created private Supabase bucket "${bucket}"`);
      } catch (e) {
        if (e.status !== 409 && !/exists/i.test(e.message)) throw e;
      }
    },

    async entries(dir) {
      const folders = [], files = [];
      for (const o of await children(dir)) {
        const name = decodeName(o.name);
        if (isReserved(name)) continue;
        if (o.id) files.push({ name, size: o.metadata?.size ?? 0, updated: timeOf(o) || Date.now() });
        else folders.push({ name, updated: 0 });
      }
      return { folders, files };
    },

    folderExists: async (dir) => dir.length === 0 || (await entryIn(dir))?.id === null,
    fileExists: async (file) => !!(await entryIn(file))?.id,

    // Idempotent: (re)writes the hidden marker.
    createFolder: (dir) => upload([...dir, KEEP], '', { overwrite: true, length: 0, contentType: 'text/plain' }),

    async move(from, to) {
      const entry = await entryIn(from);
      if (!entry) throw httpError(404, 'Not found');
      if (entry.id) return moveKey(toKey(from), toKey(to));
      const fromKey = toKey(from), destKey = toKey(to);
      for (const k of await allKeys(from)) await moveKey(k, destKey + k.slice(fromKey.length));
    },

    deleteFolder: async (dir) => removeKeys(await allKeys(dir)),
    deleteFile: (file) => removeKeys([toKey(file)]),

    async readFile(file) {
      const res = await call('GET', `/object/${bucket}/${toUrlPath(file)}`, { raw: true });
      return { stream: Readable.fromWeb(res.body), size: Number(res.headers.get('content-length')) || undefined };
    },

    // Writing a/b/c.txt also makes folders a and a/b appear, so no mkdir needed.
    async writeFile(file, input, { overwrite, maxBytes, length }) {
      const counter = limitStream(maxBytes);
      input.on('error', (e) => counter.destroy(e));
      input.pipe(counter);
      await upload(file, Readable.toWeb(counter), { overwrite, length });
      return counter.bytes;
    },
  };
};
