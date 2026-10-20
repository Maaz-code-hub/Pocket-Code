// Picks a backend (Supabase or local disk) and adds shared features on top:
// folder listings with counts, recursive walks, usage totals and the Trash.
const path = require('node:path');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const { httpError, streamToBuffer, TRASH } = require('./util');

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

  const s = Object.create(backend);

  s.exists = async (parts) => (await backend.folderExists(parts)) || (await backend.fileExists(parts));

  // Children with item counts for each sub-folder.
  s.list = async (dir) => {
    const { folders, files } = await backend.entries(dir);
    const withCounts = await Promise.all(folders.map(async (f) => {
      const kids = await backend.entries([...dir, f.name]);
      const times = [...kids.files, ...kids.folders].map(k => k.updated);
      return { name: f.name, count: kids.files.length + kids.folders.length, updated: Math.max(f.updated, ...times) };
    }));
    return { folders: withCounts, files };
  };

  // Everything below a folder, depth-first: { rel: [...names], type, size, updated }.
  s.walk = async function* walk(dir, rel = []) {
    const { folders, files } = await backend.entries([...dir, ...rel]);
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

  // Usage needs a full walk, so it's cached for 10 minutes and nudged by
  // writes/trash moves in between. `touch` forces a fresh count next time.
  let usageCache = null;
  let usagePending = null;
  s.touch = () => { usageCache = null; };
  s.usage = async () => {
    if (usageCache && Date.now() - usageCache.at < 10 * 60 * 1000) return { ...usageCache.value };
    usagePending ??= (async () => {
      // The root walk skips .trash (reserved), so count it separately.
      const [all, trash] = await Promise.all([totalSize([]), totalSize([TRASH])]);
      usageCache = { at: Date.now(), value: { used: all + trash, trash } };
    })().finally(() => { usagePending = null; });
    await usagePending;
    return { ...usageCache.value };
  };
  const adjust = (used, trash = 0) => {
    if (!usageCache) return;
    usageCache.value.used = Math.max(0, usageCache.value.used + used);
    usageCache.value.trash = Math.max(0, usageCache.value.trash + trash);
  };
  s.addUsage = (bytes) => adjust(bytes);

  const readText = async (parts) => (await streamToBuffer((await backend.readFile(parts)).stream)).toString();
  const writeText = (parts, text) => backend.writeFile(parts, Readable.from([Buffer.from(text)]), {
    overwrite: true, maxBytes: 1e6, length: Buffer.byteLength(text),
  });

  // Keep a folder visible after its last child leaves (Supabase has no real folders).
  const keepAlive = async (dir) => { if (dir.length) await backend.createFolder(dir); };

  /* ---------- Trash ----------
     .trash/<id>/<original name>   the deleted file or folder
     .trash/<id>.json              { id, path, type, deletedAt, size } */

  s.trash = {
    async put(parts) {
      const type = (await backend.folderExists(parts)) ? 'folder' : 'file';
      const size = type === 'file'
        ? ((await backend.entries(parts.slice(0, -1))).files.find(f => f.name === parts.at(-1))?.size ?? 0)
        : await totalSize(parts);
      const id = `${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
      await backend.move(parts, [TRASH, id, parts.at(-1)]);
      await writeText([TRASH, `${id}.json`], JSON.stringify({ id, path: parts, type, deletedAt: Date.now(), size }));
      await keepAlive(parts.slice(0, -1));
      adjust(0, size);
      return id;
    },

    async list() {
      if (!(await backend.folderExists([TRASH]))) return [];
      const { files } = await backend.entries([TRASH]);
      const metas = await Promise.all(files.filter(f => f.name.endsWith('.json')).map(async (f) => {
        try { return JSON.parse(await readText([TRASH, f.name])); } catch { return null; }
      }));
      return metas.filter(Boolean)
        .map(m => ({ ...m, expiresAt: m.deletedAt + TRASH_DAYS * DAY }))
        .sort((a, b) => b.deletedAt - a.deletedAt);
    },

    async get(id) {
      if (!/^[a-z0-9]+-[a-f0-9]{6}$/.test(id)) throw httpError(400, 'Invalid trash id');
      try { return JSON.parse(await readText([TRASH, `${id}.json`])); }
      catch { throw httpError(404, 'Not in trash'); }
    },

    // Puts the item back where it was. If that name is taken, adds " (restored)".
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
      adjust(0, -(meta.size || 0));
      return target;
    },

    async remove(id) {
      const meta = await s.trash.get(id);
      await backend.deleteFolder([TRASH, id]);
      await backend.deleteFile([TRASH, `${id}.json`]);
      adjust(-(meta.size || 0), -(meta.size || 0));
    },

    async empty() {
      await backend.deleteFolder([TRASH]);
      s.touch();
    },

    // Permanently remove items older than TRASH_DAYS.
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
