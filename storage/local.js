// Local disk backend. Paths are arrays of names, e.g. ['Projects', 'api', 'main.py'].
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { httpError, limitStream, isReserved } = require('./util');

module.exports = function localBackend({ dataDir }) {
  const root = path.resolve(dataDir);
  fs.mkdirSync(root, { recursive: true });

  const join = (parts) => {
    const p = path.resolve(root, ...parts);
    if (p !== root && !p.startsWith(root + path.sep)) throw httpError(400, 'Invalid path');
    return p;
  };
  const statOf = async (p) => { try { return await fsp.stat(p); } catch { return null; } };
  const mkdirp = async (dir) => {
    try { await fsp.mkdir(dir, { recursive: true }); }
    catch (e) { throw e.code === 'ENOTDIR' || e.code === 'EEXIST' ? httpError(409, 'A file is in the way of that folder path') : e; }
  };

  return {
    name: `local disk (${root})`,

    // Direct children. Folder `updated` is left to the caller.
    async entries(dir) {
      const full = join(dir);
      const list = (await fsp.readdir(full, { withFileTypes: true })).filter(e => !isReserved(e.name));
      const folders = [], files = [];
      await Promise.all(list.map(async (e) => {
        const st = await fsp.stat(path.join(full, e.name));
        if (e.isDirectory()) folders.push({ name: e.name, updated: st.mtimeMs });
        else if (e.isFile()) files.push({ name: e.name, size: st.size, updated: st.mtimeMs });
      }));
      return { folders, files };
    },

    folderExists: async (dir) => (await statOf(join(dir)))?.isDirectory() ?? false,
    fileExists: async (file) => (await statOf(join(file)))?.isFile() ?? false,
    createFolder: (dir) => mkdirp(join(dir)),

    async move(from, to) {
      const dest = join(to);
      await mkdirp(path.dirname(dest));
      await fsp.rename(join(from), dest);
    },

    deleteFolder: (dir) => fsp.rm(join(dir), { recursive: true, force: true }),
    deleteFile: (file) => fsp.rm(join(file), { force: true }),

    async readFile(file) {
      const fp = join(file);
      const st = await statOf(fp);
      if (!st?.isFile()) throw httpError(404, 'File not found');
      return { stream: fs.createReadStream(fp), size: st.size };
    },

    async writeFile(file, input, { overwrite, maxBytes }) {
      const fp = join(file);
      if (!overwrite && await statOf(fp)) throw httpError(409, 'File already exists');
      await mkdirp(path.dirname(fp));
      const tmp = path.join(path.dirname(fp), `.upload-${crypto.randomUUID()}`);
      const counter = limitStream(maxBytes);
      try {
        await new Promise((resolve, reject) => {
          const out = fs.createWriteStream(tmp);
          input.on('error', reject);
          counter.on('error', reject);
          out.on('error', reject);
          out.on('finish', resolve);
          input.pipe(counter).pipe(out);
        });
        await fsp.rename(tmp, fp);
      } catch (e) { await fsp.rm(tmp, { force: true }); throw e; }
      return counter.bytes;
    },
  };
};
