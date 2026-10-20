'use strict';

const $ = (sel, el = document) => el.querySelector(sel);
const app = $('#app');
const searchInput = $('#search');
const fileInput = $('#fileInput');
const dirInput = $('#dirInput');

const ICONS = {
  folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  folderPlus: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M12 10v6M9 13h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  zip: '<path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8z"/><path d="M14 3v5h5M10 7h1M10 10h1M10 13h1M9 16h3v2H9z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"/>',
  restore: '<path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.7L4 9"/><path d="M4 4v5h5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 011-1h10"/>',
  file: '<path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8z"/><path d="M14 3v5h5"/>',
  code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/>',
  link: '<path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 017.8-1.2"/>',
  wrap: '<path d="M4 6h16M4 12h13a3 3 0 010 6h-4M4 18h5"/><path d="M15 16l-2 2 2 2"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>`;

const CODE_EXT = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java', kt: 'kotlin', swift: 'swift', c: 'c', h: 'c',
  cpp: 'cpp', cc: 'cpp', hpp: 'cpp', cs: 'csharp', php: 'php', sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'bash',
  ps1: 'powershell', sql: 'sql', html: 'xml', htm: 'xml', xml: 'xml', svg: 'xml', css: 'css', scss: 'scss',
  less: 'less', json: 'json', yml: 'yaml', yaml: 'yaml', toml: 'ini', ini: 'ini', env: 'bash', dockerfile: 'dockerfile',
  lua: 'lua', r: 'r', dart: 'dart', scala: 'scala', vue: 'xml', svelte: 'xml', graphql: 'graphql', makefile: 'makefile',
  gitignore: 'bash', dockerignore: 'bash',
};
const DOC_EXT = ['txt', 'md', 'markdown', 'log', 'csv', 'tsv', 'rtf'];
const IMG_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'];
const VIDEO_EXT = ['mp4', 'webm', 'mov'];
const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'm4a'];
// Skipped when uploading a whole folder.
const SKIP_DIRS = new Set(['.git', 'node_modules', '__pycache__', '.venv', '.next']);
const SKIP_FILES = new Set(['.DS_Store', 'Thumbs.db']);

const ext = (name) => {
  const lower = name.toLowerCase();
  if (lower === 'dockerfile' || lower === 'makefile') return lower;
  const i = lower.lastIndexOf('.');
  return i >= 0 ? lower.slice(i + 1) : '';
};
function kind(name) {
  const e = ext(name);
  if (IMG_EXT.includes(e)) return 'img';
  if (e === 'pdf') return 'pdf';
  if (e === 'md' || e === 'markdown') return 'md';
  if (VIDEO_EXT.includes(e)) return 'video';
  if (AUDIO_EXT.includes(e)) return 'audio';
  if (CODE_EXT[e]) return 'code';
  if (DOC_EXT.includes(e) || e === '' || name.startsWith('.')) return 'text';
  return 'other';
}
const isTextual = (name) => ['code', 'md', 'text'].includes(kind(name));

function fileIcon(name) {
  const k = kind(name), e = ext(name);
  const cls = { code: 'code', md: 'doc', text: 'doc', img: 'img', pdf: 'pdf' }[k] || '';
  return `<div class="ficon ${cls}">${esc((e || 'txt').slice(0, 4))}</div>`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtSize(b) {
  if (b < 1024) return `${b} B`;
  const u = ['KB', 'MB', 'GB']; let i = -1;
  do { b /= 1024; i++; } while (b >= 1024 && i < u.length - 1);
  return `${b.toFixed(b < 10 ? 1 : 0)} ${u[i]}`;
}
function fmtDate(ms) {
  if (!ms) return '—';
  const d = new Date(ms), diff = (Date.now() - ms) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* ---------- Paths ---------- */
// A path is an array of names: [] is the root, ['Projects', 'api'] a sub-folder.
const enc = encodeURIComponent;
const joinPath = (parts) => parts.map(enc).join('/');
const dirHash = (parts) => (parts.length ? `#/f/${joinPath(parts)}` : '#/');
const folderApi = (parts) => `/folders${parts.length ? `/${joinPath(parts)}` : ''}`;
const fileUrl = (parts) => `/api/files/${joinPath(parts)}`;
const zipUrl = (parts) => `/api/zip/${joinPath(parts)}`;

/* ---------- Permissions ---------- */
const perms = { editLocked: false, canEdit: true };

async function api(path, opts = {}) {
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: opts.body && typeof opts.body === 'string' ? { 'Content-Type': 'application/json', ...opts.headers } : opts.headers,
  });
  if (res.status === 401) { renderLock(); throw new Error('Access key required'); }
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.text();
  if (res.status === 403) { perms.canEdit = false; renderEditLock(); render(); }
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
  return data;
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, { error = false, sticky = false, action = null } = {}) {
  const t = $('#toast'), btn = $('.toast-action', t);
  $('.toast-msg', t).textContent = msg;
  btn.hidden = !action;
  if (action) {
    btn.textContent = action.label;
    btn.onclick = () => { t.className = 'toast'; action.fn(); };
  }
  t.className = `toast show${error ? ' error' : ''}`;
  clearTimeout(toastTimer);
  if (!sticky) toastTimer = setTimeout(() => (t.className = 'toast'), action ? 6000 : 2800);
}
const toastError = (msg) => toast(msg, { error: true });

/* ---------- Storage meter ---------- */
let usageTimer;
async function loadUsage() {
  try {
    const { used, trash, limit } = await api('/usage');
    const pct = Math.min(100, (used / limit) * 100);
    const meter = $('#meter');
    meter.hidden = false;
    meter.className = `meter${pct >= 95 ? ' full' : pct >= 80 ? ' warn' : ''}`;
    $('.meter-bar span', meter).style.width = `${Math.max(pct, used ? 1.5 : 0)}%`;
    $('.meter-text', meter).textContent = `${fmtSize(used)} of ${fmtSize(limit)}`;
    meter.title = `${pct.toFixed(1)}% used${trash ? ` · ${fmtSize(trash)} in Trash` : ''}`;
  } catch {}
}
const scheduleUsage = () => { clearTimeout(usageTimer); usageTimer = setTimeout(loadUsage, 1200); };

/* ---------- Modal ---------- */
function modal({ title, sub = '', body = '', foot = '', wide = false, headTools = '', onClose }) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `
    <div class="modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div style="flex:1;min-width:0"><h2>${esc(title)}</h2>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
        ${headTools}
        <button class="icon-btn" data-close title="Close">${icon('close')}</button>
      </div>
      ${body}
      ${foot ? `<div class="modal-foot">${foot}</div>` : ''}
    </div>`;
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    bg.remove(); document.removeEventListener('keydown', onKey); onClose?.();
  };
  const onKey = (e) => {
    if (e.key !== 'Escape' || [...document.querySelectorAll('.modal-bg')].at(-1) !== bg) return;
    if (document.querySelector('.CodeMirror-dialog')) return; // let the editor's search box close first
    close();
  };
  bg.addEventListener('mousedown', (e) => { if (e.target === bg) close(); });
  bg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', onKey);
  document.body.appendChild(bg);
  return { el: bg, close };
}

function prompt({ title, label, value = '', confirm = 'Save', type = 'text', placeholder = '' }) {
  return new Promise((resolve) => {
    let done = false;
    const m = modal({
      title,
      body: `<div class="modal-body"><div class="field"><label>${esc(label)}</label><input class="input" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" spellcheck="false"></div></div>`,
      foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" data-ok>${esc(confirm)}</button>`,
      onClose: () => { if (!done) resolve(null); },
    });
    const input = $('input', m.el);
    const ok = () => { const v = input.value.trim(); if (!v) return input.focus(); done = true; m.close(); resolve(v); };
    $('[data-ok]', m.el).onclick = ok;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
    setTimeout(() => {
      input.focus();
      if (type === 'text') { const dot = value.lastIndexOf('.'); input.setSelectionRange(0, dot > 0 ? dot : value.length); }
    });
  });
}

function confirmDialog({ title, message, confirm = 'Delete', cancel = 'Cancel', danger = true }) {
  return new Promise((resolve) => {
    let done = false;
    const m = modal({
      title,
      body: `<div class="modal-body"><p class="msg">${message}</p></div>`,
      foot: `<button class="btn" data-close>${esc(cancel)}</button><button class="btn ${danger ? 'danger solid' : 'primary'}" data-ok>${esc(confirm)}</button>`,
      onClose: () => { if (!done) resolve(false); },
    });
    const ok = $('[data-ok]', m.el);
    ok.onclick = () => { done = true; m.close(); resolve(true); };
    setTimeout(() => ok.focus());
  });
}

/* ---------- Edit lock (view-only mode) ---------- */
function renderEditLock() {
  const btn = $('#editLock');
  $('#trashLink').hidden = !perms.canEdit;
  btn.hidden = !perms.editLocked;
  if (!perms.editLocked) return;
  btn.className = `lock-btn${perms.canEdit ? ' unlocked' : ''}`;
  btn.innerHTML = perms.canEdit ? `${icon('unlock')}<span>Editing</span>` : `${icon('lock')}<span>View only</span>`;
  btn.title = perms.canEdit ? 'Editing is unlocked on this browser. Click to lock.' : 'Click to unlock editing';
}

async function unlockEditing() {
  const key = await prompt({ title: 'Unlock editing', label: 'Edit key', confirm: 'Unlock', type: 'password', placeholder: 'Enter the edit key' });
  if (!key) return false;
  const res = await fetch('/api/auth?scope=edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
  if (!res.ok) { toastError('Wrong key'); return false; }
  perms.canEdit = true;
  renderEditLock(); render();
  toast('Editing unlocked on this browser');
  return true;
}

$('#editLock').onclick = async () => {
  if (!perms.canEdit) return unlockEditing();
  await fetch('/api/auth?scope=edit', { method: 'DELETE' });
  perms.canEdit = false;
  renderEditLock();
  if (location.hash.startsWith('#/trash')) location.hash = '#/'; else render();
  toast('Locked. This browser is view-only now.');
};

/* ---------- Routing ---------- */
let state = { view: 'dir', path: [], data: null };

function route() {
  searchInput.value = '';
  const h = location.hash.slice(1) || '/';
  if (h === '/trash') return showTrash();
  let path = [];
  if (h.startsWith('/f/')) {
    try { path = h.slice(3).split('/').filter(Boolean).map(decodeURIComponent); } catch {}
  }
  showDir(path);
}
window.addEventListener('hashchange', route);
searchInput.addEventListener('input', () => render());

async function showDir(path) {
  const s = state = { view: 'dir', path, data: null };
  searchInput.placeholder = path.length ? `Search in ${path.at(-1)}…` : 'Search folders…';
  render();
  try {
    const data = await api(folderApi(path));
    if (state !== s) return; // navigated away meanwhile
    s.data = data;
    render();
  } catch (e) {
    if (state !== s) return;
    toastError(e.message);
    if (e.status === 404) location.hash = dirHash(path.slice(0, -1));
  }
}

async function showTrash() {
  const s = state = { view: 'trash', path: [], data: null };
  searchInput.placeholder = 'Search trash…';
  render();
  try {
    const data = await api('/trash');
    if (state !== s) return;
    s.data = data;
    render();
  } catch (e) {
    if (state !== s) return;
    toastError(e.message);
    if (e.status === 403) location.hash = '#/';
  }
}

const refresh = () => (state.view === 'trash' ? showTrash() : showDir(state.path));
// Call after anything that changes stored data.
const changed = () => { refresh(); scheduleUsage(); };

/* ---------- Render ---------- */
function render() {
  if (state.view === 'trash') return renderTrash();
  const { path, data } = state;
  const isRoot = path.length === 0;
  const edit = perms.canEdit;
  const q = searchInput.value.trim().toLowerCase();
  const match = (i) => !q || i.name.toLowerCase().includes(q);
  const folders = data ? data.folders.filter(match) : [];
  const files = data ? data.files.filter(match) : [];
  const total = data ? data.folders.length + data.files.length : 0;

  document.title = isRoot ? 'Code Saver' : `${path.at(-1)} · Code Saver`;

  const crumbs = isRoot ? '' : `
    <nav class="crumbs">
      <a href="#/" title="All folders">${icon('home')}</a>
      ${path.slice(0, -1).map((name, i) => `${icon('chevron')}<a href="${dirHash(path.slice(0, i + 1))}">${esc(name)}</a>`).join('')}
      ${icon('chevron')}
    </nav>`;

  const subText = !data ? 'Loading…' : isRoot ? plural(data.folders.length, 'folder')
    : [data.folders.length && plural(data.folders.length, 'folder'), data.files.length && plural(data.files.length, 'file'),
       data.files.length && fmtSize(data.files.reduce((s, f) => s + f.size, 0))].filter(Boolean).join(' · ') || 'Empty';

  const zipBtn = !isRoot && total ? `<a class="btn" href="${zipUrl(path)}" title="Download this folder as a .zip">${icon('zip')} Download ZIP</a>` : '';
  const actions = !edit ? zipBtn : isRoot
    ? `<button class="btn primary" data-act="newFolder">${icon('plus')} New folder</button>`
    : `${zipBtn}
       <button class="btn" data-act="newFolder">${icon('folderPlus')} New folder</button>
       <div class="menu-wrap">
         <button class="btn" data-act="uploadMenu">${icon('upload')} Upload ${icon('down')}</button>
         <div class="menu" hidden>
           <button data-act="uploadFiles">${icon('file')} Files</button>
           <button data-act="uploadFolder">${icon('folder')} Folder</button>
         </div>
       </div>
       <button class="btn primary" data-act="newDoc">${icon('plus')} New doc / code</button>`;

  let content;
  if (!data) content = '<div class="spin">Loading…</div>';
  else if (total === 0) content = isRoot ? `
      <div class="empty">
        <div class="big">${icon('folder')}</div>
        <h3>No folders yet</h3>
        <p>${edit ? 'Create a folder to start saving your code and docs.' : 'Nothing has been saved here yet.'}</p>
        ${edit ? `<div class="actions"><button class="btn primary" data-act="newFolder">${icon('plus')} Create folder</button></div>` : ''}
      </div>` : `
      <div class="empty">
        <div class="big">${icon('file')}</div>
        <h3>This folder is empty</h3>
        ${edit ? `
        <p>Write a snippet, upload files or a whole folder, or add a sub-folder.<br>You can also drag &amp; drop files and folders anywhere.</p>
        <div class="actions">
          <button class="btn" data-act="newFolder">${icon('folderPlus')} New folder</button>
          <button class="btn" data-act="uploadFiles">${icon('upload')} Upload</button>
          <button class="btn primary" data-act="newDoc">${icon('code')} Write code / doc</button>
        </div>` : '<p>Nothing in here yet.</p>'}
      </div>`;
  else {
    const showLabels = !isRoot && data.folders.length > 0 && data.files.length > 0;
    content = `
      ${folders.length ? `
        ${showLabels ? '<div class="section-label">Folders</div>' : ''}
        <div class="grid${isRoot ? '' : ' compact'}">
          ${folders.map(f => `
            <a class="folder" href="${dirHash([...path, f.name])}">
              <div class="folder-icon">${icon('folder')}</div>
              <div class="folder-text">
                <div class="folder-name" title="${esc(f.name)}">${esc(f.name)}</div>
                <div class="folder-meta">${plural(f.count, 'item')} · ${fmtDate(f.updated)}</div>
              </div>
              <div class="tools${edit ? '' : ' one'}">
                <span class="icon-btn" data-zip="${esc(f.name)}" title="Download as ZIP">${icon('download')}</span>
                ${edit ? `
                <button class="icon-btn" data-rename-folder="${esc(f.name)}" title="Rename">${icon('edit')}</button>
                <button class="icon-btn danger" data-delete-folder="${esc(f.name)}" title="Move to Trash">${icon('trash')}</button>` : ''}
              </div>
            </a>`).join('')}
          ${isRoot && !q && edit ? `<button class="folder new" data-act="newFolder">${icon('plus')}<span>New folder</span></button>` : ''}
        </div>` : ''}
      ${files.length ? `
        ${showLabels ? '<div class="section-label">Files</div>' : ''}
        <div class="list">
          ${files.map(f => `
            <div class="row" data-open="${esc(f.name)}">
              <div class="name">${fileIcon(f.name)}<span title="${esc(f.name)}">${esc(f.name)}</span></div>
              <div class="meta">${fmtSize(f.size)}</div>
              <div class="meta">${fmtDate(f.updated)}</div>
              <div class="tools">
                <a class="icon-btn" href="${fileUrl([...path, f.name])}?download" title="Download" data-stop>${icon('download')}</a>
                ${edit ? `
                <button class="icon-btn" data-rename-file="${esc(f.name)}" title="Rename">${icon('edit')}</button>
                <button class="icon-btn danger" data-delete-file="${esc(f.name)}" title="Move to Trash">${icon('trash')}</button>` : ''}
              </div>
            </div>`).join('')}
        </div>` : ''}
      ${q && !folders.length && !files.length ? '<div class="spin">Nothing matches your search.</div>' : ''}
      ${!isRoot && edit ? '<div class="hint">Tip: drag &amp; drop files or whole folders anywhere on this page to upload.</div>' : ''}`;
  }

  app.innerHTML = `
    <div class="page-head">
      <div style="min-width:0">
        ${crumbs}
        <h1>${isRoot ? 'Folders' : esc(path.at(-1))}</h1>
        <div class="sub">${subText}</div>
      </div>
      <div class="actions">${actions}</div>
    </div>
    ${content}`;

  bindActions();
}

function bindActions() {
  const path = state.path;
  const menu = $('.menu', app);
  const acts = {
    newFolder: createFolder,
    newDoc: () => openEditor(),
    uploadFiles: () => { if (menu) menu.hidden = true; fileInput.click(); },
    uploadFolder: () => { menu.hidden = true; dirInput.click(); },
    uploadMenu: (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; },
  };
  app.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', (e) => acts[b.dataset.act](e)));

  app.querySelectorAll('[data-stop]').forEach(a => a.addEventListener('click', e => e.stopPropagation()));
  app.querySelectorAll('[data-open]').forEach(r => r.onclick = () => openPreview(r.dataset.open));

  app.querySelectorAll('[data-zip]').forEach(b => b.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    location.href = zipUrl([...path, b.dataset.zip]);
  });
  app.querySelectorAll('[data-rename-folder]').forEach(b => b.onclick = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const old = b.dataset.renameFolder;
    const name = await prompt({ title: 'Rename folder', label: 'Folder name', value: old });
    if (!name || name === old) return;
    try { await api(folderApi([...path, old]), { method: 'PATCH', body: JSON.stringify({ name }) }); toast('Folder renamed'); changed(); }
    catch (err) { toastError(err.message); }
  });
  app.querySelectorAll('[data-delete-folder]').forEach(b => b.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    moveToTrash(folderApi([...path, b.dataset.deleteFolder]), b.dataset.deleteFolder);
  });
  app.querySelectorAll('[data-rename-file]').forEach(b => b.onclick = (e) => { e.stopPropagation(); renameFile(b.dataset.renameFile); });
  app.querySelectorAll('[data-delete-file]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    moveToTrash(`/files/${joinPath([...path, b.dataset.deleteFile])}`, b.dataset.deleteFile);
  });
}
document.addEventListener('click', () => { const m = $('.menu', app); if (m) m.hidden = true; });

async function createFolder() {
  const path = state.path;
  const name = await prompt({ title: path.length ? `New folder in ${path.at(-1)}` : 'New folder', label: 'Folder name', confirm: 'Create' });
  if (!name) return;
  try { await api(folderApi(path), { method: 'POST', body: JSON.stringify({ name }) }); location.hash = dirHash([...path, name]); }
  catch (e) { toastError(e.message); }
}

async function renameFile(old) {
  const name = await prompt({ title: 'Rename file', label: 'File name', value: old });
  if (!name || name === old) return false;
  try {
    await api(`/files/${joinPath([...state.path, old])}`, { method: 'PATCH', body: JSON.stringify({ name }) });
    toast('File renamed'); changed(); return true;
  } catch (e) { toastError(e.message); return false; }
}

// Delete = move to Trash, with an Undo button in the toast.
async function moveToTrash(apiPath, name) {
  try {
    const { trashId } = await api(apiPath, { method: 'DELETE' });
    changed();
    toast(`Moved “${name}” to Trash`, {
      action: {
        label: 'Undo',
        fn: async () => {
          try { await api(`/trash/${trashId}/restore`, { method: 'POST' }); toast('Restored'); changed(); }
          catch (e) { toastError(e.message); }
        },
      },
    });
    return true;
  } catch (e) { toastError(e.message); return false; }
}

/* ---------- Trash ---------- */
function renderTrash() {
  const data = state.data;
  const q = searchInput.value.trim().toLowerCase();
  const items = data ? data.items.filter(i => !q || i.path.join('/').toLowerCase().includes(q)) : [];
  document.title = 'Trash · Code Saver';
  const daysLeft = (i) => Math.max(0, Math.ceil((i.expiresAt - Date.now()) / 86400000));

  app.innerHTML = `
    <div class="page-head">
      <div style="min-width:0">
        <nav class="crumbs"><a href="#/" title="All folders">${icon('home')}</a>${icon('chevron')}</nav>
        <h1>Trash</h1>
        <div class="sub">${data ? `${plural(data.items.length, 'item')} · deleted forever after ${data.days} days` : 'Loading…'}</div>
      </div>
      <div class="actions">${data?.items.length ? `<button class="btn danger" data-empty>${icon('trash')} Empty trash</button>` : ''}</div>
    </div>
    ${!data ? '<div class="spin">Loading…</div>' : !data.items.length ? `
      <div class="empty">
        <div class="big">${icon('trash')}</div>
        <h3>Trash is empty</h3>
        <p>Deleted files and folders stay here for ${data.days} days so you can restore them.</p>
      </div>` : `
      <div class="list">
        ${items.map(i => {
          const name = i.path.at(-1);
          return `
          <div class="row trash-row">
            <div class="name">
              ${i.type === 'folder' ? `<div class="ficon dir">${icon('folder')}</div>` : fileIcon(name)}
              <div class="trash-text">
                <span title="${esc(name)}">${esc(name)}</span>
                <small title="${esc(i.path.join(' / '))}">from ${esc(i.path.slice(0, -1).join(' / '))}</small>
              </div>
            </div>
            <div class="meta">${i.size ? fmtSize(i.size) : '—'}</div>
            <div class="meta" title="Deleted ${new Date(i.deletedAt).toLocaleString()}">${daysLeft(i)}d left</div>
            <div class="tools">
              <button class="btn small" data-restore="${esc(i.id)}">${icon('restore')} Restore</button>
              <button class="icon-btn danger" data-forever="${esc(i.id)}" data-name="${esc(name)}" title="Delete forever">${icon('close')}</button>
            </div>
          </div>`;
        }).join('')}
        ${q && !items.length ? '<div class="spin">Nothing matches your search.</div>' : ''}
      </div>`}`;

  $('[data-empty]', app)?.addEventListener('click', async () => {
    if (!await confirmDialog({ title: 'Empty trash?', message: `All ${plural(data.items.length, 'item')} in the Trash will be <b>permanently deleted</b>. This can’t be undone.`, confirm: 'Empty trash' })) return;
    try { await api('/trash', { method: 'DELETE' }); toast('Trash emptied'); changed(); }
    catch (e) { toastError(e.message); }
  });
  app.querySelectorAll('[data-restore]').forEach(b => b.onclick = async () => {
    try {
      const { path } = await api(`/trash/${b.dataset.restore}/restore`, { method: 'POST' });
      toast(`Restored to ${path.slice(0, -1).join(' / ')}`, { action: { label: 'Open', fn: () => (location.hash = dirHash(path.slice(0, -1))) } });
      changed();
    } catch (e) { toastError(e.message); }
  });
  app.querySelectorAll('[data-forever]').forEach(b => b.onclick = async () => {
    if (!await confirmDialog({ title: 'Delete forever?', message: `<b>${esc(b.dataset.name)}</b> will be permanently deleted. This can’t be undone.`, confirm: 'Delete forever' })) return;
    try { await api(`/trash/${b.dataset.forever}`, { method: 'DELETE' }); toast('Deleted forever'); changed(); }
    catch (e) { toastError(e.message); }
  });
}

/* ---------- Upload ---------- */
function uploadOne(parts, file, { overwrite = false, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const qs = ['mkdirs=1', overwrite && 'overwrite=1'].filter(Boolean).join('&');
    xhr.open('PUT', `${fileUrl(parts)}?${qs}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded);
    xhr.onload = () => {
      if (xhr.status < 300) return resolve();
      let msg = 'Upload failed';
      try { msg = JSON.parse(xhr.responseText).error; } catch {}
      reject(Object.assign(new Error(msg), { status: xhr.status }));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(file);
  });
}

let bar;
function setProgress(p) {
  if (!bar) { bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar); }
  bar.style.width = `${Math.round(Math.min(p, 1) * 100)}%`;
  if (p >= 1) setTimeout(() => { bar?.remove(); bar = null; }, 300);
}

// items: [{ file: File, rel: ['sub', 'dir', 'name.ext'] }] relative to the current folder.
async function uploadItems(items, skipped = 0) {
  const base = state.path;
  if (state.view !== 'dir' || !base.length || !perms.canEdit) return;
  if (!items.length) {
    if (skipped) toast(`Skipped ${plural(skipped, 'file')} (.git, node_modules, …)`);
    return;
  }
  const totalBytes = items.reduce((s, i) => s + i.file.size, 0) || 1;
  let doneBytes = 0, ok = 0, stop = false;
  const conflicts = [], failed = [];

  const run = async (item, overwrite) => {
    try {
      await uploadOne([...base, ...item.rel], item.file, {
        overwrite, onProgress: (loaded) => setProgress((doneBytes + loaded) / totalBytes),
      });
      ok++;
    } catch (e) {
      if (e.status === 409 && !overwrite && e.message === 'File already exists') conflicts.push(item);
      else failed.push(`${item.rel.join('/')}: ${e.message}`);
      if (e.status === 507 || e.status === 403) stop = true; // storage full / not allowed
    }
    doneBytes += item.file.size;
    setProgress(doneBytes / totalBytes);
  };

  for (const [i, item] of items.entries()) {
    if (stop) break;
    if (items.length > 1) toast(`Uploading ${i + 1} of ${items.length}…`, { sticky: true });
    await run(item, false);
  }
  setProgress(1);

  if (conflicts.length && !stop) {
    const one = conflicts.length === 1;
    const replace = await confirmDialog({
      title: one ? 'Replace file?' : 'Replace files?',
      message: one ? `<b>${esc(conflicts[0].rel.join('/'))}</b> already exists. Replace it?`
        : `${conflicts.length} files already exist. Replace them all?`,
      confirm: one ? 'Replace' : 'Replace all', cancel: one ? 'Cancel' : 'Skip them', danger: false,
    });
    if (replace) {
      doneBytes = 0;
      for (const item of conflicts) await run(item, true);
      setProgress(1);
    }
  }

  const summary = [ok && `Uploaded ${plural(ok, 'file')}`, skipped && `skipped ${skipped} (.git, node_modules, …)`].filter(Boolean);
  if (failed.length) toastError(`${failed.length} failed — ${failed[0]}`);
  else toast(summary.join(', ') || 'Nothing uploaded');
  changed();
}

const keepFile = (rel) => !rel.some((p, i) => (i < rel.length - 1 ? SKIP_DIRS.has(p) : SKIP_FILES.has(p)));

function fromFileList(list) {
  const all = [...list].map(f => ({ file: f, rel: (f.webkitRelativePath || f.name).split('/').filter(Boolean) }));
  const kept = all.filter(i => keepFile(i.rel));
  return [kept, all.length - kept.length];
}

fileInput.addEventListener('change', () => { uploadItems(...fromFileList(fileInput.files)); fileInput.value = ''; });
dirInput.addEventListener('change', () => { uploadItems(...fromFileList(dirInput.files)); dirInput.value = ''; });

// Walk dropped folders recursively.
async function walkEntry(entry, rel, out, counts) {
  if (entry.isFile) {
    const path = [...rel, entry.name];
    if (!keepFile(path)) { counts.skipped++; return; }
    out.push({ file: await new Promise((res, rej) => entry.file(res, rej)), rel: path });
  } else if (entry.isDirectory) {
    if (SKIP_DIRS.has(entry.name)) { counts.skipped++; return; }
    const reader = entry.createReader();
    for (;;) {
      const batch = await new Promise((res, rej) => reader.readEntries(res, rej));
      if (!batch.length) break;
      for (const child of batch) await walkEntry(child, [...rel, entry.name], out, counts);
    }
  }
}

let dragDepth = 0;
const overlay = $('#dropOverlay');
const canDrop = (e) => state.view === 'dir' && state.path.length > 0 && perms.canEdit &&
  !document.querySelector('.modal-bg') && [...(e.dataTransfer?.types || [])].includes('Files');
window.addEventListener('dragenter', (e) => { if (!canDrop(e)) return; e.preventDefault(); dragDepth++; overlay.classList.add('show'); });
window.addEventListener('dragover', (e) => { if (canDrop(e)) e.preventDefault(); });
window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; overlay.classList.remove('show'); } });
window.addEventListener('drop', async (e) => {
  if (!canDrop(e)) return;
  e.preventDefault(); dragDepth = 0; overlay.classList.remove('show');
  const entries = [...e.dataTransfer.items].map(i => i.webkitGetAsEntry?.()).filter(Boolean);
  if (!entries.length) return uploadItems(...fromFileList(e.dataTransfer.files));
  const out = [], counts = { skipped: 0 };
  toast('Reading files…', { sticky: true });
  for (const entry of entries) await walkEntry(entry, [], out, counts);
  uploadItems(out, counts.skipped);
});

/* ---------- Editor (CodeMirror) ---------- */
CodeMirror.modeURL = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/%N/%N.min.js';

function modeFor(name) {
  const lower = name.toLowerCase();
  const info = CodeMirror.findModeByFileName(name) || CodeMirror.findModeByFileName(lower)
    || (/^\.env|\.env$|^\.(git|docker)ignore$/.test(lower) ? CodeMirror.findModeByName('Shell') : null);
  return info || { name: 'Plain text', mode: null, mime: 'text/plain' };
}

let wrapLines = (() => { try { return localStorage.getItem('wrap') === '1'; } catch { return false; } })();

function openEditor(existing = null, content = '') {
  const folder = state.path;
  const m = modal({
    title: existing ? `Edit ${existing}` : 'New doc / code',
    sub: `in ${esc(folder.join(' / '))}`,
    wide: true,
    body: `
      <div class="editor-body">
        <input class="input editor-name" placeholder="File name, e.g. script.py, notes.md, query.sql" value="${esc(existing || '')}" spellcheck="false">
        <div class="editor-cm"></div>
      </div>`,
    foot: `<span class="editor-status"><span class="lang"></span><span class="pos"></span></span>
           <button class="icon-btn${wrapLines ? ' on' : ''}" data-wrap title="Wrap long lines">${icon('wrap')}</button>
           <span class="kbd-hint">Ctrl+S save · Ctrl+F find · Ctrl+/ comment</span>
           <button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save</button>`,
  });
  const nameIn = $('.editor-name', m.el);
  const langEl = $('.lang', m.el), posEl = $('.pos', m.el);

  const cm = CodeMirror($('.editor-cm', m.el), {
    value: content,
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    lineWrapping: wrapLines,
    matchBrackets: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    viewportMargin: 50,
    extraKeys: {
      'Ctrl-S': () => save(), 'Cmd-S': () => save(),
      'Ctrl-/': 'toggleComment', 'Cmd-/': 'toggleComment',
      Tab: (c) => (c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('  ', 'end')),
      'Shift-Tab': (c) => c.indentSelection('subtract'),
    },
  });
  cm.setSize('100%', '100%');

  const applyMode = () => {
    const info = modeFor(nameIn.value.trim() || 'untitled.txt');
    langEl.textContent = info.name;
    if (info.mode && info.mode !== 'null') {
      CodeMirror.autoLoadMode(cm, info.mode);
      cm.setOption('mode', info.mime || info.mode);
    } else cm.setOption('mode', null);
  };
  const showPos = () => { const c = cm.getCursor(); posEl.textContent = `Ln ${c.line + 1}, Col ${c.ch + 1}`; };
  nameIn.addEventListener('input', applyMode);
  nameIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); cm.focus(); } });
  cm.on('cursorActivity', showPos);
  applyMode(); showPos();

  $('[data-wrap]', m.el).onclick = (e) => {
    wrapLines = !wrapLines;
    try { localStorage.setItem('wrap', wrapLines ? '1' : '0'); } catch {}
    cm.setOption('lineWrapping', wrapLines);
    e.currentTarget.classList.toggle('on', wrapLines);
  };

  let saving = false;
  const save = async () => {
    if (saving) return;
    let name = nameIn.value.trim();
    if (!name) { nameIn.focus(); return toastError('Give the file a name'); }
    if (name.includes('/')) return toastError('File name can’t contain “/”');
    if (!/\.[^.]+$/.test(name) && !/^(dockerfile|makefile)$/i.test(name)) name += '.txt';
    const file = new File([cm.getValue()], name, { type: 'text/plain' });
    saving = true;
    try {
      if (existing && name !== existing) {
        await api(`/files/${joinPath([...folder, existing])}`, { method: 'PATCH', body: JSON.stringify({ name }) });
      }
      try { await uploadOne([...folder, name], file, { overwrite: !!existing && name === existing }); }
      catch (e) {
        if (e.status !== 409 || e.message !== 'File already exists') throw e;
        if (!await confirmDialog({ title: 'Replace file?', message: `<b>${esc(name)}</b> already exists. Replace it?`, confirm: 'Replace', danger: false })) return;
        await uploadOne([...folder, name], file, { overwrite: true });
      }
      m.close();
      toast('Saved');
      changed();
    } catch (e) { toastError(e.message); }
    finally { saving = false; }
  };
  $('[data-save]', m.el).onclick = save;
  nameIn.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });

  setTimeout(() => { cm.refresh(); if (existing) cm.focus(); else nameIn.focus(); });
}

/* ---------- Preview ---------- */
async function openPreview(name) {
  const parts = [...state.path, name];
  const url = fileUrl(parts);
  const k = kind(name);
  const file = state.data.files.find(f => f.name === name);
  const textual = isTextual(name);
  const edit = perms.canEdit;

  const m = modal({
    title: name,
    sub: [esc(state.path.join(' / ')), file && fmtSize(file.size), file && fmtDate(file.updated)].filter(Boolean).join(' · '),
    wide: true,
    headTools: `
      ${textual ? `<button class="icon-btn" data-copy title="Copy contents">${icon('copy')}</button>` : ''}
      ${textual && edit ? `<button class="icon-btn" data-edit title="Edit">${icon('edit')}</button>` : ''}
      <button class="icon-btn" data-link title="Copy download link">${icon('link')}</button>
      ${edit ? `<button class="icon-btn danger" data-del title="Move to Trash">${icon('trash')}</button>` : ''}
      <a class="btn primary" href="${url}?download" style="margin:0 4px">${icon('download')} Download</a>`,
    body: `<div class="preview-body"><div class="spin">Loading preview…</div></div>`,
  });
  const body = $('.preview-body', m.el);
  let text = null;

  $('[data-link]', m.el).onclick = () => copy(`${location.origin}${url}?download`, 'Download link copied');
  if (edit) $('[data-del]', m.el).onclick = async () => { if (await moveToTrash(`/files/${joinPath(parts)}`, name)) m.close(); };

  try {
    if (k === 'img') body.innerHTML = `<div class="preview-center"><img src="${url}" alt="${esc(name)}"></div>`;
    else if (k === 'pdf') body.innerHTML = `<iframe src="${url}" title="${esc(name)}"></iframe>`;
    else if (k === 'video') body.innerHTML = `<div class="preview-center"><video src="${url}" controls></video></div>`;
    else if (k === 'audio') body.innerHTML = `<div class="preview-center"><audio src="${url}" controls></audio></div>`;
    else if (textual) {
      if (file && file.size > 5 * 1024 * 1024) throw new Error('too-big');
      const res = await fetch(url);
      if (!res.ok) throw new Error('Could not load file');
      text = await res.text();
      if (k === 'md') {
        body.innerHTML = `<div class="markdown">${DOMPurify.sanitize(marked.parse(text))}</div>`;
        body.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
      } else {
        const lang = CODE_EXT[ext(name)];
        const code = document.createElement('code');
        code.className = 'hljs';
        if (lang && hljs.getLanguage(lang)) code.innerHTML = hljs.highlight(text, { language: lang }).value;
        else code.textContent = text;
        const pre = document.createElement('pre');
        pre.appendChild(code);
        body.replaceChildren(pre);
      }
    } else throw new Error('no-preview');
  } catch (e) {
    const tooBig = e.message === 'too-big';
    body.innerHTML = `
      <div class="preview-center"><div class="no-preview">
        <div class="big">${icon('file')}</div>
        <h3 style="color:var(--text);margin:0 0 4px">${tooBig ? 'File too large to preview' : 'No preview available'}</h3>
        <p style="margin:0 0 18px">${tooBig ? 'Download it to view the full contents.' : 'This file type can’t be shown in the browser.'}</p>
        <a class="btn primary" href="${url}?download">${icon('download')} Download</a>
      </div></div>`;
  }

  if (textual) {
    $('[data-copy]', m.el).onclick = () => text != null && copy(text, 'Copied to clipboard');
    if (edit) $('[data-edit]', m.el).onclick = () => { if (text == null) return; m.close(); openEditor(name, text); };
  }
}

async function copy(str, msg) {
  try { await navigator.clipboard.writeText(str); }
  catch {
    const ta = Object.assign(document.createElement('textarea'), { value: str });
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  toast(msg);
}

/* ---------- Optional access key (whole site) ---------- */
function renderLock() {
  if ($('#lockForm')) return;
  app.innerHTML = `
    <div class="empty" style="max-width:420px;margin:48px auto">
      <div class="big">${icon('lock')}</div>
      <h3>Enter access key</h3>
      <p>This saver is protected with a key.</p>
      <form id="lockForm" style="display:flex;gap:8px">
        <input class="input" type="password" placeholder="Access key" autofocus>
        <button class="btn primary">Unlock</button>
      </form>
    </div>`;
  $('#lockForm').onsubmit = async (e) => {
    e.preventDefault();
    const key = $('#lockForm input').value;
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
    if (res.ok) start(); else toastError('Wrong key');
  };
}

async function start() {
  try {
    const s = await (await fetch('/api/status')).json();
    if (s.locked && !s.authorized) return renderLock();
    perms.editLocked = s.editLocked;
    perms.canEdit = s.canEdit;
  } catch {}
  renderEditLock();
  route();
  loadUsage();
}
start();
