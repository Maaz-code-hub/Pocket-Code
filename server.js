// Personal Code/Doc Saver — zero-dependency Node server.
// Files are stored in Supabase Storage (if configured) or on local disk.
const http = require('node:http');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { httpError, isReserved, streamToBuffer } = require('./storage/util');
const { createStorage, TRASH_DAYS } = require('./storage');
const { createZip } = require('./storage/zip');

// Load .env if present (Node 20.12+).
try { process.loadEnvFile(path.join(__dirname, '.env')); } catch {}

const PORT = Number(process.env.PORT) || 3000;
const MAX_UPLOAD = (Number(process.env.MAX_UPLOAD_MB) || 50) * 1024 * 1024;
const STORAGE_LIMIT = (Number(process.env.STORAGE_LIMIT_MB) || 1024) * 1024 * 1024;
const ACCESS_KEY = process.env.ACCESS_KEY || ''; // optional: needed to open the site at all
const EDIT_KEY = process.env.EDIT_KEY || '';     // optional: needed to change anything (view-only mode)
const PUBLIC_DIR = path.join(__dirname, 'public');

const storage = createStorage(process.env, __dirname);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
};

// Names: no slashes, no control chars, not "." / "..", not reserved, sane length.
function validName(name) {
  return typeof name === 'string' && name.length > 0 && name.length <= 200 &&
    !/[\/\\\x00-\x1f]/.test(name) && name !== '.' && name !== '..' &&
    !isReserved(name) && name.trim() === name;
}

const MAX_DEPTH = 32;
function checkPath(parts, what) {
  if (parts.length > MAX_DEPTH) throw httpError(400, 'Folder nesting too deep');
  if (!parts.every(validName)) throw httpError(400, `Invalid ${what} name`);
}

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, { 'Content-Type': isJson ? 'application/json' : 'text/plain; charset=utf-8', ...headers });
  res.end(isJson ? JSON.stringify(body) : body);
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 1e5) throw httpError(413, 'Too large'); }
  try { return JSON.parse(raw || '{}'); } catch { throw httpError(400, 'Bad JSON'); }
}

/* ---------- Keys ---------- */

function cookie(req, name) {
  const c = (req.headers.cookie || '').split(/;\s*/).find(c => c.startsWith(`${name}=`));
  return c ? decodeURIComponent(c.slice(name.length + 1)) : '';
}
function keyMatches(given, expected) {
  const a = Buffer.from(String(given || '')), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const canView = (req) => !ACCESS_KEY || keyMatches(cookie(req, 'key'), ACCESS_KEY);
const canEdit = (req) => !EDIT_KEY || keyMatches(cookie(req, 'ekey'), EDIT_KEY);
function setCookie(req, name, value, maxAge) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

async function handleAuth(req, res, url) {
  const scope = url.searchParams.get('scope') === 'edit' ? 'edit' : 'view';
  const [name, expected] = scope === 'edit' ? ['ekey', EDIT_KEY] : ['key', ACCESS_KEY];
  if (req.method === 'DELETE') return send(res, 200, { ok: true }, { 'Set-Cookie': setCookie(req, name, '', 0) });
  if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
  const { key } = await readJson(req);
  if (!expected) return send(res, 200, { ok: true });
  if (!keyMatches(key, expected)) {
    await new Promise(r => setTimeout(r, 400)); // slow down guessing
    throw httpError(401, 'Wrong key');
  }
  return send(res, 200, { ok: true }, { 'Set-Cookie': setCookie(req, name, key, 60 * 60 * 24 * 365) });
}

/* ---------- Folders & files ----------
   /api/folders/<path...>  GET list · POST create child {name} · PATCH rename {name} · DELETE (to trash)
   /api/files/<path...>    GET content (?download) · PUT upload (?overwrite=1&mkdirs=1) · PATCH rename · DELETE (to trash)
   /api/zip/<path...>      GET folder as .zip
   /api/trash              GET list · DELETE empty
   /api/trash/<id>         POST restore · DELETE forever
   /api/usage              GET storage used */

async function handleFolders(req, res, parts) {
  const m = req.method;
  checkPath(parts, 'folder');
  if (!(await storage.folderExists(parts))) throw httpError(404, 'Folder not found');

  if (m === 'GET') {
    const { folders, files } = await storage.list(parts);
    return send(res, 200, {
      folders: folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
      files: parts.length ? files.sort((a, b) => b.updated - a.updated) : [], // root holds folders only
    });
  }
  if (m === 'POST') {
    const { name } = await readJson(req);
    if (!validName(name)) throw httpError(400, 'Invalid folder name');
    const target = [...parts, name];
    checkPath(target, 'folder');
    if (await storage.exists(target)) throw httpError(409, 'A file or folder with that name already exists');
    await storage.createFolder(target);
    return send(res, 201, { name, count: 0, updated: Date.now() });
  }
  if (!parts.length) throw httpError(405, 'Method not allowed');
  if (m === 'PATCH') {
    const { name } = await readJson(req);
    if (!validName(name)) throw httpError(400, 'Invalid folder name');
    if (name === parts.at(-1)) return send(res, 200, { ok: true });
    const target = [...parts.slice(0, -1), name];
    if (await storage.exists(target)) throw httpError(409, 'A file or folder with that name already exists');
    await storage.move(parts, target);
    return send(res, 200, { ok: true });
  }
  if (m === 'DELETE') return send(res, 200, { ok: true, trashId: await storage.trash.put(parts) });
  throw httpError(405, 'Method not allowed');
}

async function handleFiles(req, res, parts, url) {
  const m = req.method;
  checkPath(parts, 'file');
  if (parts.length < 2) throw httpError(400, 'Files must be inside a folder');
  const parent = parts.slice(0, -1), file = parts.at(-1);

  if (m === 'PUT') {
    // ?mkdirs=1 creates missing parent folders (used by folder upload).
    if (url.searchParams.get('mkdirs') !== '1' && !(await storage.folderExists(parent))) throw httpError(404, 'Folder not found');
    if (await storage.folderExists(parts)) throw httpError(409, 'A folder with that name already exists');
    const length = Number(req.headers['content-length'] || 0);
    if (length > MAX_UPLOAD) throw httpError(413, `File too large (max ${Math.round(MAX_UPLOAD / 1048576)} MB)`);
    const { used } = await storage.usage();
    if (used + length > STORAGE_LIMIT) throw httpError(507, 'Storage is full. Empty the trash or delete files to free space.');
    const size = await storage.writeFile(parts, req, {
      overwrite: url.searchParams.get('overwrite') === '1',
      maxBytes: MAX_UPLOAD,
      length,
    });
    storage.addUsage(size);
    return send(res, 201, { name: file, size, updated: Date.now() });
  }

  if (!(await storage.fileExists(parts))) throw httpError(404, 'File not found');

  if (m === 'GET') {
    const { stream, size } = await storage.readFile(parts);
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const disp = url.searchParams.has('download') ? 'attachment' : 'inline';
    const headers = {
      'Content-Type': type,
      'Content-Disposition': `${disp}; filename*=UTF-8''${encodeURIComponent(file)}`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    };
    if (size !== undefined) headers['Content-Length'] = size;
    // Uploaded files never run scripts on this origin. PDFs are exempt because
    // the browser's PDF viewer refuses to load inside a sandboxed document.
    if (type !== 'application/pdf') headers['Content-Security-Policy'] = "sandbox; default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'";
    res.writeHead(200, headers);
    stream.on('error', () => res.destroy());
    return stream.pipe(res);
  }

  if (m === 'PATCH') {
    const { name } = await readJson(req);
    if (!validName(name)) throw httpError(400, 'Invalid file name');
    if (name === file) return send(res, 200, { ok: true });
    if (await storage.exists([...parent, name])) throw httpError(409, 'A file or folder with that name already exists');
    await storage.move(parts, [...parent, name]);
    return send(res, 200, { ok: true });
  }

  if (m === 'DELETE') return send(res, 200, { ok: true, trashId: await storage.trash.put(parts) });
  throw httpError(405, 'Method not allowed');
}

async function handleZip(req, res, parts) {
  if (req.method !== 'GET') throw httpError(405, 'Method not allowed');
  checkPath(parts, 'folder');
  if (!parts.length || !(await storage.folderExists(parts))) throw httpError(404, 'Folder not found');
  const name = parts.at(-1);
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(`${name}.zip`)}`,
    'Cache-Control': 'no-cache',
  });
  const zip = createZip(res);
  try {
    await zip.add(name, null, Date.now());
    for await (const e of storage.walk(parts)) {
      const entryName = [name, ...e.rel].join('/');
      if (e.type === 'folder') await zip.add(entryName, null, e.updated);
      else await zip.add(entryName, await streamToBuffer((await storage.readFile([...parts, ...e.rel])).stream), e.updated);
    }
    await zip.finish();
    res.end();
  } catch (err) {
    console.error('ZIP failed:', err.message);
    res.destroy();
  }
}

async function handleTrash(req, res, parts) {
  const m = req.method, [id, action] = parts;
  if (!id) {
    if (m === 'GET') return send(res, 200, { days: TRASH_DAYS, items: await storage.trash.list() });
    if (m === 'DELETE') { await storage.trash.empty(); return send(res, 200, { ok: true }); }
  } else {
    if (m === 'POST' && action === 'restore') return send(res, 200, { ok: true, path: await storage.trash.restore(id) });
    if (m === 'DELETE' && !action) { await storage.trash.remove(id); return send(res, 200, { ok: true }); }
  }
  throw httpError(405, 'Method not allowed');
}

async function handleApi(req, res, url) {
  let segs;
  try { segs = url.pathname.slice(5).split('/').filter(Boolean).map(decodeURIComponent); }
  catch { throw httpError(400, 'Bad path'); }
  const [kind, ...parts] = segs;

  if (kind === 'auth') return handleAuth(req, res, url);
  if (kind === 'status') {
    return send(res, 200, { locked: !!ACCESS_KEY, authorized: canView(req), editLocked: !!EDIT_KEY, canEdit: canEdit(req) });
  }
  if (!canView(req)) throw httpError(401, 'Access key required');

  // View-only mode: anything that changes data (and the trash) needs the edit key.
  const writes = req.method !== 'GET' || kind === 'trash';
  if (writes && !canEdit(req)) throw httpError(403, 'This site is view-only. Unlock editing to make changes.');

  if (kind === 'usage') return send(res, 200, { ...(await storage.usage()), limit: STORAGE_LIMIT });
  if (kind === 'folders') return handleFolders(req, res, parts);
  if (kind === 'files') return handleFiles(req, res, parts, url);
  if (kind === 'zip') return handleZip(req, res, parts);
  if (kind === 'trash') return handleTrash(req, res, parts);
  throw httpError(404, 'Not found');
}

async function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
  const fp = path.resolve(PUBLIC_DIR, rel);
  if (!fp.startsWith(PUBLIC_DIR + path.sep)) return send(res, 404, 'Not found');
  try {
    const data = await fsp.readFile(fp);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    // SPA fallback
    const html = await fsp.readFile(path.join(PUBLIC_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': MIME['.html'] });
    res.end(html);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    if (req.method !== 'GET') throw httpError(405, 'Method not allowed');
    return await serveStatic(req, res, url.pathname);
  } catch (err) {
    if (!res.headersSent) send(res, err.status || 500, { error: err.status ? err.message : 'Server error' });
    else res.destroy();
    if (!err.status) console.error(err);
  }
});

async function purgeTrash() {
  try { await storage.trash.purge(); } catch (e) { console.error('Trash cleanup failed:', e.message); }
}

(async () => {
  await storage.init?.();
  server.listen(PORT, () => {
    console.log(`Pocket Code running on http://localhost:${PORT}`);
    console.log(`Storing files in ${storage.name}`);
    if (ACCESS_KEY) console.log('Access key enabled: the site asks for a key to open.');
    if (EDIT_KEY) console.log('Edit key enabled: view-only until unlocked.');
  });
  purgeTrash();
  setInterval(purgeTrash, 6 * 60 * 60 * 1000).unref();
})().catch((e) => { console.error(`Startup failed: ${e.message}`); process.exit(1); });
