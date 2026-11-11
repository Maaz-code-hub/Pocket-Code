// Picks a backend (Supabase or local disk) and adds Redis / in-memory caching
// plus shared features on top: folder listings with counts, recursive walks,
// usage totals and the Trash.
const path = require('node:path');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { httpError, streamToBuffer, TRASH } = require('./util');
const { createCache } = require('./cache');

const TRASH_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

function createStorage(env, rootDir) {
  const backend = env.SUPABASE_URL
    ? require('./supabase')({
        url: env.SUPABASE_URL,
        key: env.SUPABASE_SERVICE_KEY || (() => { throw new Error('SUPABASE_SERVICE_KEY is required when SUPABASE_URL is set'); })(),
        bucket: env.SUPABASE_BUCKET || 'code-saver',
      })
    : require('./local')({ dataDir: env.DATA_DIR || path.join(rootDir, 'data') });

  const cache = createCache(env);
  const toKey = (parts) => (parts && parts.length ? parts.join('/') : '__root__');

  // Cache Invalidation Helper: clears cached folder lists, existence, usage, and files
  async function invalidatePath(parts, isFolder = false) {
    const parent = parts.slice(0, -1);
    const keys = [
      `list:${toKey(parent)}`,
      `entries:${toKey(parent)}`,
      `exists:${toKey(parts)}`,
      `exists:${toKey(parent)}`,
      'usage',
    ];
    if (isFolder) {
      keys.push(`fexists:${toKey(parts)}`, `list:${toKey(parts)}`, `entries:${toKey(parts)}`);
    } else {
      keys.push(`fileexists:${toKey(parts)}`, `file:${toKey(parts)}`, `signed:${toKey(parts)}:0`, `signed:${toKey(parts)}:1`);
    }
    await cache.del(...keys);
    if (isFolder) {
      await cache.delPattern(`*:${toKey(parts)}*`);
    } else {
      await cache.delPattern(`signed:${toKey(parts)}*`);
    }
  }

  const s = Object.create(backend);
  s.cache = cache;
  s.invalidatePath = invalidatePath;

  let pingStatus = null;
  s.ping = async () => {
    try {
      const res = await backend.ping();
      pingStatus = { ok: true, at: Date.now(), error: null };
      return res;
    } catch (err) {
      pingStatus = { ok: false, at: Date.now(), error: err.message };
      throw err;
    }
  };
  s.pingStatus = () => pingStatus;

  // Folder exists check (cached for 12h)
  s.folderExists = async (parts) => {
    const key = `fexists:${toKey(parts)}`;
    const hit = await cache.getJson(key);
    if (hit !== null) return hit;
    const res = await backend.folderExists(parts);
    await cache.setJson(key, res);
    return res;
  };

  // File exists check (cached for 12h)
  s.fileExists = async (parts) => {
    const key = `fileexists:${toKey(parts)}`;
    const hit = await cache.getJson(key);
    if (hit !== null) return hit;
    const res = await backend.fileExists(parts);
    await cache.setJson(key, res);
    return res;
  };

  // Combined exists check (cached for 12h)
  s.exists = async (parts) => {
    const key = `exists:${toKey(parts)}`;
    const hit = await cache.getJson(key);
    if (hit !== null) return hit;
    const res = (await s.folderExists(parts)) || (await s.fileExists(parts));
    await cache.setJson(key, res);
    return res;
  };

  // Cached entries helper
  s.entries = async (dir) => {
    const key = `entries:${toKey(dir)}`;
    const hit = await cache.getJson(key);
    if (hit !== null) return hit;
    const res = await backend.entries(dir);
    await cache.setJson(key, res);
    return res;
  };

  // Children with item counts for each sub-folder (cached for 12h)
  s.list = async (dir) => {
    const key = `list:${toKey(dir)}`;
    const hit = await cache.getJson(key);
    if (hit !== null) return hit;

    const { folders, files } = await s.entries(dir);
    const withCounts = await Promise.all(folders.map(async (f) => {
      const kids = await s.entries([...dir, f.name]);
      const times = [...kids.files, ...kids.folders].map(k => k.updated);
      return { name: f.name, count: kids.files.length + kids.folders.length, updated: Math.max(f.updated, ...times) };
    }));

    const result = { folders: withCounts, files };
    await cache.setJson(key, result);
    return result;
  };

  // Read file with caching for small/medium files (<= 5MB)
  s.readFile = async (parts) => {
    const key = `file:${toKey(parts)}`;
    const cachedBuf = await cache.getBuffer(key);
    if (cachedBuf) {
      return { stream: Readable.from(cachedBuf), size: cachedBuf.length };
    }

    const { stream, size } = await backend.readFile(parts);
    if (size !== undefined && size <= cache.maxFileBytes) {
      const buf = await streamToBuffer(stream);
      await cache.setBuffer(key, buf);
      return { stream: Readable.from(buf), size: buf.length };
    }
    return { stream, size };
  };

  // Presigned download URL with caching (45m TTL)
  if (typeof backend.createSignedDownloadUrl === 'function') {
    s.createSignedDownloadUrl = async (parts, opts = {}) => {
      const dlKey = opts.download ? (typeof opts.download === 'string' ? opts.download : '1') : '0';
      const key = `signed:${toKey(parts)}:${dlKey}`;
      const hit = await cache.getJson(key);
      if (hit) return hit;

      const signedUrl = await backend.createSignedDownloadUrl(parts, opts);
      if (signedUrl) {
        // Cache signed URL for 45 minutes (Supabase token is valid for 60 minutes)
        await cache.setJson(key, signedUrl, 45 * 60);
      }
      return signedUrl;
    };
  }

  // Write file with instant invalidation
  s.writeFile = async (parts, contentStream, opts) => {
    const size = await backend.writeFile(parts, contentStream, opts);
    await invalidatePath(parts, false);
    return size;
  };

  // Create folder with instant invalidation
  s.createFolder = async (target) => {
    await backend.createFolder(target);
    await invalidatePath(target, true);
  };

  // Move / rename with instant invalidation
  s.move = async (fromParts, toParts) => {
    const isFolder = await s.folderExists(fromParts);
    await backend.move(fromParts, toParts);
    await Promise.all([
      invalidatePath(fromParts, isFolder),
      invalidatePath(toParts, isFolder),
      cache.del('usage'),
    ]);
  };

  // Copy with instant invalidation
  s.copy = async (fromParts, toParts) => {
    const isFolder = await s.folderExists(fromParts);
    await backend.copy(fromParts, toParts);
    await Promise.all([
      invalidatePath(toParts, isFolder),
      cache.del('usage'),
    ]);
  };

  // Delete file with instant invalidation
  s.deleteFile = async (parts) => {
    await backend.deleteFile(parts);
    await invalidatePath(parts, false);
  };

  // Delete folder with instant invalidation
  s.deleteFolder = async (parts) => {
    await backend.deleteFolder(parts);
    await invalidatePath(parts, true);
  };

  // Everything below a folder, depth-first: { rel: [...names], type, size, updated }.
  s.walk = async function* walk(dir, rel = []) {
    const { folders, files } = await s.entries([...dir, ...rel]);
    for (const f of files) yield { rel: [...rel, f.name], type: 'file', size: f.size, updated: f.updated };
    for (const f of folders) {
      yield { rel: [...rel, f.name], type: 'folder', size: 0, updated: f.updated };
      yield* walk(dir, [...rel, f.name]);
    }
  };

  async function totalSize(dir) {
    let bytes = 0;
    try { for await (const e of s.walk(dir)) bytes += e.size; }
    catch (e) { if (e.code !== 'ENOENT' && e.status !== 404) throw e; }
    return bytes;
  }
  s.totalSize = totalSize;

  // Usage cached for 12 hours (Redis & memory)
  s.touch = () => { cache.del('usage'); };
  s.usage = async () => {
    const hit = await cache.getJson('usage');
    if (hit) return hit;
    const [all, trash] = await Promise.all([totalSize([]), totalSize([TRASH])]);
    const val = { used: all + trash, trash };
    await cache.setJson('usage', val);
    return val;
  };
  const adjust = async (used, trash = 0) => {
    const current = await cache.getJson('usage');
    if (current) {
      current.used = Math.max(0, current.used + used);
      current.trash = Math.max(0, current.trash + trash);
      await cache.setJson('usage', current);
    }
  };
  s.addUsage = (bytes) => adjust(bytes);

  const readText = async (parts) => (await streamToBuffer((await backend.readFile(parts)).stream)).toString();
  const writeText = (parts, text) => backend.writeFile(parts, Readable.from([Buffer.from(text)]), {
    overwrite: true, maxBytes: 1e6, length: Buffer.byteLength(text),
  });

  const keepAlive = async (dir) => { if (dir.length) await backend.createFolder(dir); };

  /* ---------- Trash ---------- */
  s.trash = {
    async put(parts) {
      const type = (await s.folderExists(parts)) ? 'folder' : 'file';
      const size = type === 'file'
        ? ((await s.entries(parts.slice(0, -1))).files.find(f => f.name === parts.at(-1))?.size ?? 0)
        : await totalSize(parts);
      const id = `${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
      await backend.move(parts, [TRASH, id, parts.at(-1)]);
      await writeText([TRASH, `${id}.json`], JSON.stringify({ id, path: parts, type, deletedAt: Date.now(), size }));
      await keepAlive(parts.slice(0, -1));
      await Promise.all([
        invalidatePath(parts, true),
        invalidatePath(parts, false),
        cache.del('trash:list', 'usage'),
        adjust(0, size),
      ]);
      return id;
    },

    async list() {
      const hit = await cache.getJson('trash:list');
      if (hit !== null) return hit;
      if (!(await s.folderExists([TRASH]))) {
        await cache.setJson('trash:list', []);
        return [];
      }
      const { files } = await backend.entries([TRASH]);
      const metas = await Promise.all(files.filter(f => f.name.endsWith('.json')).map(async (f) => {
        try { return JSON.parse(await readText([TRASH, f.name])); } catch { return null; }
      }));
      const items = metas.filter(Boolean)
        .map(m => ({ ...m, expiresAt: m.deletedAt + TRASH_DAYS * DAY }))
        .sort((a, b) => b.deletedAt - a.deletedAt);
      await cache.setJson('trash:list', items);
      return items;
    },

    async get(id) {
      if (!/^[a-z0-9]+-[a-f0-9]{6}$/.test(id)) throw httpError(400, 'Invalid trash id');
      try { return JSON.parse(await readText([TRASH, `${id}.json`])); }
      catch { throw httpError(404, 'Not in trash'); }
    },

    async restore(id) {
      const meta = await s.trash.get(id);
      const dir = meta.path.slice(0, -1), name = meta.path.at(-1);
      let target = meta.path;
      for (let n = 1; await s.exists(target); n++) {
        const dot = meta.type === 'file' ? name.lastIndexOf('.') : -1;
        const [stem, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ''];
        target = [...dir, `${stem} (restored${n > 1 ? ` ${n}` : ''})${ext}`];
      }
      await backend.move([TRASH, id, name], target);
      await backend.deleteFile([TRASH, `${id}.json`]);
      await backend.deleteFolder([TRASH, id]);
      await Promise.all([
        invalidatePath(target, true),
        invalidatePath(target, false),
        cache.del('trash:list', 'usage'),
        adjust(0, -(meta.size || 0)),
      ]);
      return target;
    },

    async remove(id) {
      const meta = await s.trash.get(id);
      await backend.deleteFolder([TRASH, id]);
      await backend.deleteFile([TRASH, `${id}.json`]);
      await Promise.all([
        cache.del('trash:list', 'usage'),
        adjust(-(meta.size || 0), -(meta.size || 0)),
      ]);
    },

    async empty() {
      await backend.deleteFolder([TRASH]);
      await cache.del('trash:list', 'usage');
    },

    async purge() {
      const now = Date.now();
      for (const item of await s.trash.list()) {
        if (item.expiresAt <= now) await s.trash.remove(item.id);
      }
    },
  };

  return s;
}

module.exports = { createStorage, TRASH_DAYS };
