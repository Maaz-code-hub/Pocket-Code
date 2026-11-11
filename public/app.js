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
  cut: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  paste: '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
  move: '<path d="M5 12h14M13 6l6 6-6 6"/><path d="M5 7v10"/>',
  folderMove: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M11 13h6M14 10l3 3-3 3"/>',
  file: '<path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8z"/><path d="M14 3v5h5"/>',
  code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/>',
  link: '<path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 017.8-1.2"/>',
  wrap: '<path d="M4 6h16M4 12h13a3 3 0 010 6h-4M4 18h5"/><path d="M15 16l-2 2 2 2"/>',
  bold: '<path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/>',
  italic: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
  underline: '<path d="M6 3v7a6 6 0 0012 0V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
  strikethrough: '<path d="M16 4H9a3 3 0 00-3 3v1a3 3 0 003 3h6a3 3 0 013 3v1a3 3 0 01-3 3H8"/><line x1="4" y1="12" x2="20" y2="12"/>',
  alignLeft: '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
  alignCenter: '<line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/>',
  alignRight: '<line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>',
  alignJustify: '<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/>',
  listUl: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  listOl: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>',
  redo: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"/>',
  clear: '<path d="M18 6L6 18M6 6l12 12"/>',
  word: '<rect x="3" y="3" width="18" height="18" rx="3.5" fill="#185abd" stroke="none"/><path d="M6.8 7.5l2.4 8.5h1.5l1.6-5.8 1.6 5.8h1.5l2.4-8.5h-1.8l-1.3 5.5-1.5-5.5h-1.6l-1.5 5.5-1.3-5.5H6.8z" fill="#ffffff" stroke="none"/>',
  save: '<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  indent: '<polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>',
  outdent: '<polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>',
  subscript: '<path d="M4 6l6 6M10 6l-6 6"/><path d="M16 16c0-.9.7-1.5 1.5-1.5s1.5.6 1.5 1.5c0 .9-.8 1.3-1.4 1.8h1.4"/>',
  superscript: '<path d="M4 12l6 6M10 12l-6 6"/><path d="M16 7c0-.9.7-1.5 1.5-1.5s1.5.6 1.5 1.5c0 .9-.8 1.3-1.4 1.8h1.4"/>',
  textColor: '<path d="M6 16h12M12 4L6 18h2.5l1.3-3.2h4.4l1.3 3.2H18L12 4z"/><line x1="3" y1="21" x2="21" y2="21" stroke-width="2.5" stroke="#185abd"/>',
  highlighter: '<path d="M9 11l-6 6v3h3l6-6"/><path d="M22 6a3 3 0 00-4.24-4.24l-7.5 7.5 4.24 4.24L22 6z"/><line x1="3" y1="21" x2="21" y2="21" stroke-width="2.5" stroke="#facc15"/>',
  horizontalRule: '<line x1="3" y1="12" x2="21" y2="12" stroke-width="2"/>',
  callout: '<rect x="3" y="4" width="18" height="16" rx="3"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="14" y2="12"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  margins: '<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="8" y="7" width="8" height="10" stroke-dasharray="2 2"/>',
  marginsNarrow: '<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="6" y="5" width="12" height="14" stroke-dasharray="2 2"/>',
  marginsWide: '<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="9" y="8" width="6" height="8" stroke-dasharray="2 2"/>',
  pageLayout: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>',
  maximize: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>',
  minimize: '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><polyline points="14 10 21 3"/><polyline points="3 21 10 14"/>',
  quote: '<path d="M3 11h4a3 3 0 01-3 3v2a5 5 0 005-5V6H3v5zm11 0h4a3 3 0 01-3 3v2a5 5 0 005-5V6h-6v5z"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;

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
  if (e === 'docx' || e === 'doc') return 'docx';
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
  const cls = { code: 'code', md: 'doc', text: 'doc', docx: 'doc', img: 'img', pdf: 'pdf' }[k] || '';
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
function modal({ title = '', sub = '', body = '', foot = '', wide = false, extraClass = '', noHead = false, headTools = '', onClose }) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg' + (extraClass ? ` bg-${extraClass}` : '');
  bg.innerHTML = `
    <div class="modal${wide ? ' wide' : ''}${extraClass ? ' ' + extraClass : ''}" role="dialog" aria-modal="true">
      ${noHead ? '' : `
      <div class="modal-head">
        <div style="flex:1;min-width:0"><h2>${esc(title)}</h2>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
        ${headTools}
        <button class="icon-btn" data-close title="Close">${icon('close')}</button>
      </div>`}
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

/* ---------- Clipboard & Move / Copy / Paste ---------- */
let clipboard = null;
let selectedItem = null;
try {
  const saved = sessionStorage.getItem('devlocker_clip');
  if (saved) clipboard = JSON.parse(saved);
} catch {}

function setClipboard(val) {
  clipboard = val;
  try {
    if (val) sessionStorage.setItem('devlocker_clip', JSON.stringify(val));
    else sessionStorage.removeItem('devlocker_clip');
  } catch {}
  renderClipboardBar();
  render();
}

function copyItem(type, name) {
  const itemPath = [...state.path, name];
  setClipboard({ action: 'copy', type, path: itemPath, name });
  toast(`Copied ${type} "${name}" to clipboard.`);
}

function cutItem(type, name) {
  const itemPath = [...state.path, name];
  setClipboard({ action: 'cut', type, path: itemPath, name });
  toast(`Cut "${name}". Open destination and click Paste.`);
}

function renderClipboardBar() {
  let bar = $('#clipboardBar');
  if (!clipboard) {
    if (bar) bar.remove();
    return;
  }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'clipboardBar';
    bar.className = 'clipboard-bar';
    document.body.appendChild(bar);
  }
  const isCut = clipboard.action === 'cut';
  bar.innerHTML = `
    <div class="clipboard-info">
      <span class="clipboard-badge">${isCut ? 'Move' : 'Copy'}</span>
      <span class="clipboard-name" title="${esc(clipboard.name)}">${esc(clipboard.name)}</span>
    </div>
    <div class="clipboard-actions">
      <button class="btn primary small" id="clipPasteBtn">${icon('paste')} Paste here</button>
      <button class="icon-btn small" id="clipClearBtn" title="Clear clipboard">${icon('close')}</button>
    </div>
  `;
  $('#clipPasteBtn', bar).onclick = () => pasteItem();
  $('#clipClearBtn', bar).onclick = () => setClipboard(null);
}

function generateCopyName(name, existingNames = []) {
  const set = new Set(existingNames.map(n => n.toLowerCase()));
  const dot = name.lastIndexOf('.');
  const hasExt = dot > 0 && !name.startsWith('.');
  const base = hasExt ? name.slice(0, dot) : name;
  const ext = hasExt ? name.slice(dot) : '';

  let candidate = `${base} (Copy)${ext}`;
  let i = 2;
  while (set.has(candidate.toLowerCase())) {
    candidate = `${base} (Copy ${i})${ext}`;
    i++;
  }
  return candidate;
}

async function duplicateItem(type, name) {
  let existingNames = [];
  try {
    if (state.data) {
      existingNames = type === 'folder'
        ? state.data.folders.map(f => f.name)
        : state.data.files.map(f => f.name);
    }
  } catch {}
  const copyName = generateCopyName(name, existingNames);
  try {
    await api('/copy', {
      method: 'POST',
      body: JSON.stringify({
        type,
        from: [...state.path, name],
        to: state.path,
        name: copyName,
      }),
    });
    toast(`Duplicated "${name}" as "${copyName}"`);
    changed();
  } catch (err) {
    toastError(err.message);
  }
}

async function pasteItem(targetFolder = state.path) {
  if (!clipboard) {
    toast('Clipboard is empty. Copy or cut a file or folder first.');
    return;
  }
  if (clipboard.type === 'file' && targetFolder.length === 0) {
    toastError('Files cannot be placed in root. Please open a folder first.');
    return;
  }
  if (clipboard.type === 'folder' && targetFolder.length >= clipboard.path.length &&
      clipboard.path.every((p, i) => targetFolder[i] === p)) {
    toastError('Cannot move or copy a folder into itself or its subfolder.');
    return;
  }

  let existingNames = [];
  try {
    const targetData = (targetFolder.length === state.path.length && targetFolder.every((p, i) => p === state.path[i]))
      ? state.data
      : await api(folderApi(targetFolder));
    if (targetData) {
      existingNames = clipboard.type === 'folder'
        ? targetData.folders.map(f => f.name)
        : targetData.files.map(f => f.name);
    }
  } catch {}

  const isSameFolder = (targetFolder.length === clipboard.path.slice(0, -1).length &&
    targetFolder.every((p, i) => p === clipboard.path[i]));

  let targetName = clipboard.name;
  if (isSameFolder) {
    if (clipboard.action === 'cut') {
      toast('Item is already in this folder.');
      return;
    }
    targetName = generateCopyName(clipboard.name, existingNames);
  } else if (existingNames.some(n => n.toLowerCase() === clipboard.name.toLowerCase())) {
    const choice = await confirmDialog({
      title: 'Item already exists',
      message: `"${clipboard.name}" already exists in destination. Keep both by renaming the copy?`,
      confirm: 'Keep both (rename)',
      cancel: 'Cancel',
      danger: false,
    });
    if (!choice) return;
    targetName = generateCopyName(clipboard.name, existingNames);
  }

  try {
    if (clipboard.action === 'cut') {
      await api('/move', {
        method: 'POST',
        body: JSON.stringify({
          type: clipboard.type,
          from: clipboard.path,
          to: targetFolder,
          name: targetName,
        }),
      });
      toast(`Moved "${clipboard.name}" here`);
      setClipboard(null);
    } else {
      await api('/copy', {
        method: 'POST',
        body: JSON.stringify({
          type: clipboard.type,
          from: clipboard.path,
          to: targetFolder,
          name: targetName,
        }),
      });
      toast(`Pasted "${targetName}"`);
    }
    changed();
  } catch (err) {
    toastError(err.message);
  }
}

async function openMoveDialog(type, name) {
  const sourcePath = [...state.path, name];
  let selectedFolder = null;
  let allFolders = [];

  const m = modal({
    title: `Move ${type} "${name}"`,
    sub: `Current location: ${state.path.length ? state.path.join(' / ') : 'Root'}`,
    wide: false,
    body: `
      <div class="move-dialog">
        <p class="dialog-instruction">Select destination folder:</p>
        <div class="tree-search-wrap">
          <input type="search" id="moveSearch" class="input" placeholder="Filter folders…" autocomplete="off">
        </div>
        <div class="folder-picker" id="folderPicker">
          <div class="spin" style="padding:20px;text-align:center">Loading folders…</div>
        </div>
        <div class="move-dialog-extra">
          <button class="btn small" id="moveNewFolderBtn">${icon('folderPlus')} New subfolder here</button>
        </div>
      </div>
    `,
    foot: `
      <button class="btn" id="moveCutBtn" title="Cut to clipboard and paste manually">${icon('cut')} Cut to clipboard</button>
      <div style="flex:1"></div>
      <button class="btn" data-close>Cancel</button>
      <button class="btn" id="moveCopyBtn" title="Make a copy in the selected folder" disabled>${icon('copy')} Copy here</button>
      <button class="btn primary" id="moveConfirmBtn" disabled>${icon('move')} Move here</button>
    `,
  });

  const pickerEl = $('#folderPicker', m.el);
  const searchEl = $('#moveSearch', m.el);
  const confirmBtn = $('#moveConfirmBtn', m.el);
  const copyBtn = $('#moveCopyBtn', m.el);
  const cutBtn = $('#moveCutBtn', m.el);
  const newFolderBtn = $('#moveNewFolderBtn', m.el);

  cutBtn.onclick = () => {
    m.close();
    cutItem(type, name);
  };

  const renderPicker = () => {
    const q = searchEl.value.trim().toLowerCase();
    const filtered = allFolders.filter(f => !q || (f.path.join('/') || 'root').toLowerCase().includes(q));

    if (!filtered.length) {
      pickerEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--muted)">No matching folders found</div>';
      return;
    }

    pickerEl.innerHTML = filtered.map(f => {
      const isRoot = f.path.length === 0;
      const isCurrentParent = (f.path.length === state.path.length && f.path.every((p, i) => p === state.path[i]));
      const isSelfOrDescendant = (type === 'folder' && f.path.length >= sourcePath.length && sourcePath.every((p, i) => f.path[i] === p));
      const isFileAtRoot = (type === 'file' && isRoot);
      const disabled = isSelfOrDescendant || isFileAtRoot || isCurrentParent;

      let badge = '';
      if (isCurrentParent) badge = '<span class="folder-picker-badge">Current</span>';
      else if (isSelfOrDescendant) badge = '<span class="folder-picker-badge">Cannot move here</span>';
      else if (isFileAtRoot) badge = '<span class="folder-picker-badge">Folders only</span>';

      const isSelected = selectedFolder !== null && selectedFolder.length === f.path.length && selectedFolder.every((p, i) => p === f.path[i]);
      const indent = Math.max(0, f.depth) * 16 + 8;

      return `
        <div class="folder-picker-item${isSelected ? ' selected' : ''}${disabled ? ' disabled' : ''}"
             data-fpath="${esc(JSON.stringify(f.path))}"
             style="padding-left: ${indent}px"
             ${disabled ? 'data-disabled="true"' : ''}>
          ${icon(isRoot ? 'home' : 'folder')}
          <span class="folder-picker-name" title="${esc(f.name)}">${esc(f.name)}</span>
          ${badge}
        </div>
      `;
    }).join('');

    pickerEl.querySelectorAll('.folder-picker-item:not([data-disabled="true"])').forEach(itemEl => {
      itemEl.onclick = () => {
        try {
          selectedFolder = JSON.parse(itemEl.dataset.fpath);
        } catch { return; }
        confirmBtn.disabled = false;
        copyBtn.disabled = false;
        renderPicker();
      };
    });
  };

  searchEl.addEventListener('input', renderPicker);

  newFolderBtn.onclick = async () => {
    const parentPath = selectedFolder !== null ? selectedFolder : state.path;
    const parentName = parentPath.length ? parentPath.at(-1) : 'Root';
    const folderName = await prompt({ title: `New folder in ${parentName}`, label: 'Folder name', confirm: 'Create' });
    if (!folderName) return;
    try {
      await api(folderApi(parentPath), { method: 'POST', body: JSON.stringify({ name: folderName }) });
      toast('Folder created');
      const treeRes = await api('/tree');
      allFolders = treeRes.folders || [];
      selectedFolder = [...parentPath, folderName];
      confirmBtn.disabled = false;
      copyBtn.disabled = false;
      renderPicker();
    } catch (e) {
      toastError(e.message);
    }
  };

  confirmBtn.onclick = async () => {
    if (!selectedFolder) return;
    confirmBtn.disabled = true;
    try {
      await api('/move', {
        method: 'POST',
        body: JSON.stringify({
          type,
          from: sourcePath,
          to: selectedFolder,
          name,
        }),
      });
      m.close();
      toast(`Moved "${name}" to ${selectedFolder.length ? selectedFolder.at(-1) : 'Root'}`);
      changed();
    } catch (err) {
      confirmBtn.disabled = false;
      toastError(err.message);
    }
  };

  copyBtn.onclick = async () => {
    if (!selectedFolder) return;
    copyBtn.disabled = true;
    try {
      await api('/copy', {
        method: 'POST',
        body: JSON.stringify({
          type,
          from: sourcePath,
          to: selectedFolder,
          name,
        }),
      });
      m.close();
      toast(`Copied "${name}" to ${selectedFolder.length ? selectedFolder.at(-1) : 'Root'}`);
      changed();
    } catch (err) {
      copyBtn.disabled = false;
      toastError(err.message);
    }
  };

  try {
    const treeRes = await api('/tree');
    allFolders = treeRes.folders || [];
    renderPicker();
  } catch (err) {
    pickerEl.innerHTML = `<div style="padding:16px;text-align:center;color:var(--danger)">Failed to load folders: ${esc(err.message)}</div>`;
  }
}

/* ---------- Context Menu ---------- */
function closeContextMenu() {
  const m = $('#contextMenu');
  if (m) m.remove();
}

function showContextMenu(e, item = null) {
  if (state.view === 'trash') return;
  e.preventDefault();
  closeContextMenu();
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.id = 'contextMenu';

  if (item) selectedItem = item;

  let itemsHtml = '';
  if (item?.type === 'file') {
    itemsHtml = `
      <button class="context-menu-item" data-cact="preview">${icon('code')} Open preview</button>
      <button class="context-menu-item" data-cact="download">${icon('download')} Download</button>
      ${perms.canEdit ? `
        <div class="context-menu-divider"></div>
        <button class="context-menu-item" data-cact="copy">${icon('copy')} Copy <span class="context-menu-shortcut">Ctrl+C</span></button>
        <button class="context-menu-item" data-cact="duplicate">${icon('copy')} Duplicate <span class="context-menu-shortcut">Ctrl+D</span></button>
        <button class="context-menu-item" data-cact="cut">${icon('cut')} Cut / Move <span class="context-menu-shortcut">Ctrl+X</span></button>
        <button class="context-menu-item" data-cact="move">${icon('move')} Move to…</button>
        <div class="context-menu-divider"></div>
        <button class="context-menu-item" data-cact="rename">${icon('edit')} Rename <span class="context-menu-shortcut">F2</span></button>
        <button class="context-menu-item danger" data-cact="delete">${icon('trash')} Move to Trash <span class="context-menu-shortcut">Del</span></button>
      ` : ''}
    `;
  } else if (item?.type === 'folder') {
    itemsHtml = `
      <button class="context-menu-item" data-cact="open">${icon('folder')} Open folder</button>
      <button class="context-menu-item" data-cact="zip">${icon('zip')} Download ZIP</button>
      ${perms.canEdit ? `
        <div class="context-menu-divider"></div>
        <button class="context-menu-item" data-cact="copy">${icon('copy')} Copy <span class="context-menu-shortcut">Ctrl+C</span></button>
        <button class="context-menu-item" data-cact="duplicate">${icon('copy')} Duplicate <span class="context-menu-shortcut">Ctrl+D</span></button>
        <button class="context-menu-item" data-cact="cut">${icon('cut')} Cut / Move <span class="context-menu-shortcut">Ctrl+X</span></button>
        <button class="context-menu-item" data-cact="move">${icon('move')} Move to…</button>
        ${clipboard ? `<button class="context-menu-item" data-cact="pasteInto">${icon('paste')} Paste inside "${esc(item.name)}"</button>` : ''}
        <div class="context-menu-divider"></div>
        <button class="context-menu-item" data-cact="rename">${icon('edit')} Rename <span class="context-menu-shortcut">F2</span></button>
        <button class="context-menu-item danger" data-cact="delete">${icon('trash')} Move to Trash <span class="context-menu-shortcut">Del</span></button>
      ` : ''}
    `;
  } else {
    itemsHtml = `
      ${perms.canEdit ? `
        <button class="context-menu-item" data-cact="paste" ${!clipboard ? 'disabled' : ''}>
          ${icon('paste')} Paste ${clipboard ? `"${esc(clipboard.name)}"` : ''} <span class="context-menu-shortcut">Ctrl+V</span>
        </button>
        <div class="context-menu-divider"></div>
        <button class="context-menu-item" data-cact="newFolder">${icon('folderPlus')} New folder</button>
        ${!state.path.length ? '' : `
          <button class="context-menu-item" data-cact="uploadFiles">${icon('file')} Upload files</button>
          <button class="context-menu-item" data-cact="uploadFolder">${icon('upload')} Upload folder</button>
          <button class="context-menu-item" data-cact="newDocFile">${icon('word')} New Word doc</button>
          <button class="context-menu-item" data-cact="newDoc">${icon('code')} New code / text file</button>
        `}
      ` : ''}
    `;
  }

  menu.innerHTML = itemsHtml;
  document.body.appendChild(menu);

  const rect = menu.getBoundingClientRect();
  const x = Math.min(e.clientX, window.innerWidth - rect.width - 8);
  const y = Math.min(e.clientY, window.innerHeight - rect.height - 8);
  menu.style.left = `${Math.max(8, x)}px`;
  menu.style.top = `${Math.max(8, y)}px`;

  menu.querySelectorAll('[data-cact]').forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      closeContextMenu();
      handleContextAction(btn.dataset.cact, item);
    };
  });
}

function handleContextAction(act, item) {
  if (act === 'copy' && item) copyItem(item.type, item.name);
  else if (act === 'duplicate' && item) duplicateItem(item.type, item.name);
  else if (act === 'cut' && item) cutItem(item.type, item.name);
  else if (act === 'move' && item) openMoveDialog(item.type, item.name);
  else if (act === 'paste') pasteItem();
  else if (act === 'pasteInto' && item) pasteItem([...state.path, item.name]);
  else if (act === 'preview' && item) openPreview(item.name);
  else if (act === 'download' && item) {
    location.href = `${fileUrl([...state.path, item.name])}?download`;
  } else if (act === 'open' && item) {
    location.hash = dirHash([...state.path, item.name]);
  } else if (act === 'zip' && item) {
    location.href = zipUrl([...state.path, item.name]);
  } else if (act === 'rename' && item) {
    if (item.type === 'folder') renameFolder(item.name);
    else renameFile(item.name);
  } else if (act === 'delete' && item) {
    if (item.type === 'folder') moveToTrash(folderApi([...state.path, item.name]), item.name);
    else moveToTrash(`/files/${joinPath([...state.path, item.name])}`, item.name);
  } else if (act === 'newFolder') createFolder();
  else if (act === 'uploadFiles') fileInput.click();
  else if (act === 'uploadFolder') dirInput.click();
  else if (act === 'newDocFile') openDocEditor();
  else if (act === 'newDoc') openEditor();
}

async function renameFolder(old) {
  const name = await prompt({ title: 'Rename folder', label: 'Folder name', value: old });
  if (!name || name === old) return;
  try {
    await api(folderApi([...state.path, old]), { method: 'PATCH', body: JSON.stringify({ name }) });
    toast('Folder renamed');
    changed();
  } catch (err) {
    toastError(err.message);
  }
}

document.addEventListener('click', () => closeContextMenu());
document.addEventListener('contextmenu', (e) => {
  if (!e.defaultPrevented) closeContextMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeContextMenu();
    return;
  }
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable || e.target.closest('.CodeMirror') || e.target.closest('.ql-editor')) {
    return;
  }

  const isCmdOrCtrl = e.ctrlKey || e.metaKey;
  if (isCmdOrCtrl && e.key.toLowerCase() === 'c' && selectedItem) {
    e.preventDefault();
    copyItem(selectedItem.type, selectedItem.name);
  } else if (isCmdOrCtrl && e.key.toLowerCase() === 'd' && selectedItem && perms.canEdit) {
    e.preventDefault();
    duplicateItem(selectedItem.type, selectedItem.name);
  } else if (isCmdOrCtrl && e.key.toLowerCase() === 'x' && selectedItem) {
    e.preventDefault();
    cutItem(selectedItem.type, selectedItem.name);
  } else if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
    e.preventDefault();
    pasteItem();
  } else if (e.key === 'F2' && selectedItem) {
    e.preventDefault();
    if (selectedItem.type === 'folder') renameFolder(selectedItem.name);
    else renameFile(selectedItem.name);
  } else if (e.key === 'Delete' && selectedItem && perms.canEdit) {
    e.preventDefault();
    if (selectedItem.type === 'folder') moveToTrash(folderApi([...state.path, selectedItem.name]), selectedItem.name);
    else moveToTrash(`/files/${joinPath([...state.path, selectedItem.name])}`, selectedItem.name);
  }
});

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

  document.title = isRoot ? 'DevLocker' : `${path.at(-1)} · DevLocker`;

  const crumbs = isRoot ? '' : `
    <nav class="crumbs">
      <a href="#/" title="All folders" data-crumb-path="[]">${icon('home')}</a>
      ${path.slice(0, -1).map((name, i) => `${icon('chevron')}<a href="${dirHash(path.slice(0, i + 1))}" data-crumb-path="${esc(JSON.stringify(path.slice(0, i + 1)))}">${esc(name)}</a>`).join('')}
      ${icon('chevron')}
    </nav>`;

  const subText = !data ? 'Loading…' : isRoot ? plural(data.folders.length, 'folder')
    : [data.folders.length && plural(data.folders.length, 'folder'), data.files.length && plural(data.files.length, 'file'),
       data.files.length && fmtSize(data.files.reduce((s, f) => s + f.size, 0))].filter(Boolean).join(' · ') || 'Empty';

  const zipBtn = !isRoot && total ? `<a class="btn" href="${zipUrl(path)}" title="Download this folder as a .zip">${icon('zip')} Download ZIP</a>` : '';
  const pasteBtn = edit ? `
    <button class="btn${clipboard ? ' accent' : ''}" data-act="paste" title="${clipboard ? `Paste "${esc(clipboard.name)}" (${clipboard.action === 'cut' ? 'move' : 'copy'}) here` : 'Paste (clipboard is empty — copy or cut a file or folder first)'}">
      ${icon('paste')} Paste${clipboard ? ` (${esc(clipboard.name.length > 14 ? clipboard.name.slice(0, 12) + '…' : clipboard.name)})` : ''}
    </button>` : '';

  const actions = !edit ? zipBtn : isRoot
    ? `${pasteBtn} <button class="btn primary" data-act="newFolder">${icon('plus')} New folder</button>`
    : `${zipBtn}
       ${pasteBtn}
       <button class="btn" data-act="newFolder">${icon('folderPlus')} New folder</button>
       <div class="menu-wrap">
         <button class="btn" data-act="uploadMenu">${icon('upload')} Upload ${icon('down')}</button>
         <div class="menu" hidden>
           <button data-act="uploadFiles">${icon('file')} Files</button>
           <button data-act="uploadFolder">${icon('folder')} Folder</button>
         </div>
       </div>
       <div class="menu-wrap">
         <button class="btn primary" data-act="newMenu">${icon('plus')} New ${icon('down')}</button>
         <div class="menu" hidden>
           <button data-act="newDocFile">${icon('word')} Word Document (.docx)</button>
           <button data-act="newDoc">${icon('code')} Code / Text file</button>
         </div>
       </div>`;

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
        <p>Write a snippet, upload files or a whole folder, or create a Word document.<br>You can also drag &amp; drop files and folders anywhere.</p>
        <div class="actions">
          <button class="btn" data-act="newFolder">${icon('folderPlus')} New folder</button>
          ${clipboard ? `<button class="btn accent" data-act="paste">${icon('paste')} Paste ${esc(clipboard.name)}</button>` : ''}
          <button class="btn" data-act="uploadFiles">${icon('upload')} Upload</button>
          <button class="btn" data-act="newDocFile">${icon('word')} Word doc</button>
          <button class="btn primary" data-act="newDoc">${icon('code')} Code / doc</button>
        </div>` : '<p>Nothing in here yet.</p>'}
      </div>`;
  else {
    const showLabels = !isRoot && data.folders.length > 0 && data.files.length > 0;
    content = `
      ${folders.length ? `
        ${showLabels ? '<div class="section-label">Folders</div>' : ''}
        <div class="grid${isRoot ? '' : ' compact'}">
          ${folders.map(f => {
            const isCut = clipboard?.action === 'cut' && clipboard.type === 'folder' &&
              clipboard.path.length === path.length + 1 && clipboard.path.at(-1) === f.name &&
              path.every((p, i) => clipboard.path[i] === p);
            const isCopied = clipboard?.action === 'copy' && clipboard.type === 'folder' &&
              clipboard.path.length === path.length + 1 && clipboard.path.at(-1) === f.name &&
              path.every((p, i) => clipboard.path[i] === p);
            return `
            <a class="folder${isCut ? ' is-cut' : ''}${isCopied ? ' is-copied' : ''}" href="${dirHash([...path, f.name])}" data-folder-name="${esc(f.name)}" ${edit ? 'draggable="true"' : ''}>
              <div class="folder-icon">${icon('folder')}</div>
              <div class="folder-text">
                <div class="folder-name" title="${esc(f.name)}">${esc(f.name)}</div>
                <div class="folder-meta">${plural(f.count, 'item')} · ${fmtDate(f.updated)}</div>
              </div>
              <div class="tools${edit ? '' : ' one'}">
                <span class="icon-btn" data-zip="${esc(f.name)}" title="Download as ZIP">${icon('download')}</span>
                ${edit ? `
                <button class="icon-btn" data-copy-folder="${esc(f.name)}" title="Copy folder (Ctrl+C)">${icon('copy')}</button>
                <button class="icon-btn" data-move-folder="${esc(f.name)}" title="Move folder (Ctrl+X)">${icon('move')}</button>
                <button class="icon-btn" data-rename-folder="${esc(f.name)}" title="Rename (F2)">${icon('edit')}</button>
                <button class="icon-btn danger" data-delete-folder="${esc(f.name)}" title="Move to Trash (Del)">${icon('trash')}</button>` : ''}
              </div>
            </a>`;
          }).join('')}
          ${isRoot && !q && edit ? `<button class="folder new" data-act="newFolder">${icon('plus')}<span>New folder</span></button>` : ''}
        </div>` : ''}
      ${files.length ? `
        ${showLabels ? '<div class="section-label">Files</div>' : ''}
        <div class="list">
          ${files.map(f => {
            const isCut = clipboard?.action === 'cut' && clipboard.type === 'file' &&
              clipboard.path.length === path.length + 1 && clipboard.path.at(-1) === f.name &&
              path.every((p, i) => clipboard.path[i] === p);
            const isCopied = clipboard?.action === 'copy' && clipboard.type === 'file' &&
              clipboard.path.length === path.length + 1 && clipboard.path.at(-1) === f.name &&
              path.every((p, i) => clipboard.path[i] === p);
            return `
            <div class="row${isCut ? ' is-cut' : ''}${isCopied ? ' is-copied' : ''}" data-open="${esc(f.name)}" data-file-name="${esc(f.name)}" ${edit ? 'draggable="true"' : ''}>
              <div class="name">${fileIcon(f.name)}<span title="${esc(f.name)}">${esc(f.name)}</span></div>
              <div class="meta">${fmtSize(f.size)}</div>
              <div class="meta">${fmtDate(f.updated)}</div>
              <div class="tools">
                <a class="icon-btn" href="${fileUrl([...path, f.name])}?download" title="Download" data-stop>${icon('download')}</a>
                ${edit ? `
                <button class="icon-btn" data-copy-file="${esc(f.name)}" title="Copy file (Ctrl+C)">${icon('copy')}</button>
                <button class="icon-btn" data-move-file="${esc(f.name)}" title="Move file (Ctrl+X)">${icon('move')}</button>
                <button class="icon-btn" data-rename-file="${esc(f.name)}" title="Rename (F2)">${icon('edit')}</button>
                <button class="icon-btn danger" data-delete-file="${esc(f.name)}" title="Move to Trash (Del)">${icon('trash')}</button>` : ''}
              </div>
            </div>`;
          }).join('')}
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

  renderClipboardBar();
  bindActions();
}

function bindActions() {
  const path = state.path;
  const closeAllMenus = () => app.querySelectorAll('.menu').forEach(m => m.hidden = true);
  const acts = {
    newFolder: () => { closeAllMenus(); createFolder(); },
    newDoc: () => { closeAllMenus(); openEditor(); },
    newDocFile: () => { closeAllMenus(); openDocEditor(); },
    uploadFiles: () => { closeAllMenus(); fileInput.click(); },
    uploadFolder: () => { closeAllMenus(); dirInput.click(); },
    paste: () => { closeAllMenus(); pasteItem(); },
    uploadMenu: (e) => {
      e.stopPropagation();
      const m = e.currentTarget.nextElementSibling;
      const wasHidden = m.hidden;
      closeAllMenus();
      m.hidden = !wasHidden;
    },
    newMenu: (e) => {
      e.stopPropagation();
      const m = e.currentTarget.nextElementSibling;
      const wasHidden = m.hidden;
      closeAllMenus();
      m.hidden = !wasHidden;
    },
  };
  app.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', (e) => acts[b.dataset.act]?.(e)));

  app.querySelectorAll('[data-stop]').forEach(a => a.addEventListener('click', e => e.stopPropagation()));
  app.querySelectorAll('[data-open]').forEach(r => r.onclick = () => openPreview(r.dataset.open));

  app.querySelectorAll('[data-zip]').forEach(b => b.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    location.href = zipUrl([...path, b.dataset.zip]);
  });
  app.querySelectorAll('[data-copy-folder]').forEach(b => b.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    copyItem('folder', b.dataset.copyFolder);
  });
  app.querySelectorAll('[data-move-folder]').forEach(b => b.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    openMoveDialog('folder', b.dataset.moveFolder);
  });
  app.querySelectorAll('[data-rename-folder]').forEach(b => b.onclick = async (e) => {
    e.preventDefault(); e.stopPropagation();
    renameFolder(b.dataset.renameFolder);
  });
  app.querySelectorAll('[data-delete-folder]').forEach(b => b.onclick = (e) => {
    e.preventDefault(); e.stopPropagation();
    moveToTrash(folderApi([...path, b.dataset.deleteFolder]), b.dataset.deleteFolder);
  });
  app.querySelectorAll('[data-copy-file]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    copyItem('file', b.dataset.copyFile);
  });
  app.querySelectorAll('[data-move-file]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    openMoveDialog('file', b.dataset.moveFile);
  });
  app.querySelectorAll('[data-rename-file]').forEach(b => b.onclick = (e) => { e.stopPropagation(); renameFile(b.dataset.renameFile); });
  app.querySelectorAll('[data-delete-file]').forEach(b => b.onclick = (e) => {
    e.stopPropagation();
    moveToTrash(`/files/${joinPath([...path, b.dataset.deleteFile])}`, b.dataset.deleteFile);
  });

  // Context menu bindings
  app.querySelectorAll('[data-folder-name]').forEach(fEl => {
    fEl.addEventListener('contextmenu', (e) => showContextMenu(e, { type: 'folder', name: fEl.dataset.folderName }));
    fEl.addEventListener('click', () => { selectedItem = { type: 'folder', name: fEl.dataset.folderName }; });
  });

  app.querySelectorAll('[data-file-name]').forEach(rEl => {
    rEl.addEventListener('contextmenu', (e) => showContextMenu(e, { type: 'file', name: rEl.dataset.fileName }));
    rEl.addEventListener('click', () => { selectedItem = { type: 'file', name: rEl.dataset.fileName }; });
  });

  // Blank area context menu
  const gridOrList = app.querySelector('.grid') || app.querySelector('.list') || app.querySelector('.empty');
  if (gridOrList) {
    gridOrList.addEventListener('contextmenu', (e) => {
      if (e.target === gridOrList || e.target.closest('.empty')) {
        showContextMenu(e, null);
      }
    });
  }

  // In-app Drag and Drop to move files & folders
  if (perms.canEdit) {
    // Draggable files
    app.querySelectorAll('.row[data-file-name]').forEach(row => {
      row.addEventListener('dragstart', (e) => {
        const fileName = row.dataset.fileName;
        e.dataTransfer.setData('application/x-devlocker-item', JSON.stringify({
          type: 'file',
          name: fileName,
          path: [...path, fileName],
        }));
        e.dataTransfer.effectAllowed = 'move';
        row.classList.add('is-dragging');
      });
      row.addEventListener('dragend', () => row.classList.remove('is-dragging'));
    });

    // Draggable folders & drop targets
    app.querySelectorAll('.folder[data-folder-name]').forEach(fEl => {
      fEl.addEventListener('dragstart', (e) => {
        const folderName = fEl.dataset.folderName;
        e.dataTransfer.setData('application/x-devlocker-item', JSON.stringify({
          type: 'folder',
          name: folderName,
          path: [...path, folderName],
        }));
        e.dataTransfer.effectAllowed = 'move';
        fEl.classList.add('is-dragging');
      });
      fEl.addEventListener('dragend', () => fEl.classList.remove('is-dragging'));

      fEl.addEventListener('dragover', (e) => {
        if (e.dataTransfer.types.includes('application/x-devlocker-item')) {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          fEl.classList.add('drag-over');
        }
      });
      fEl.addEventListener('dragleave', (e) => {
        if (!fEl.contains(e.relatedTarget)) {
          fEl.classList.remove('drag-over');
        }
      });
      fEl.addEventListener('drop', async (e) => {
        const raw = e.dataTransfer.getData('application/x-devlocker-item');
        if (!raw) return;
        e.preventDefault();
        e.stopPropagation();
        fEl.classList.remove('drag-over');
        try {
          const item = JSON.parse(raw);
          const targetFolder = [...path, fEl.dataset.folderName];
          if (item.type === 'folder' && targetFolder.length >= item.path.length &&
              item.path.every((p, i) => targetFolder[i] === p)) {
            toastError('Cannot move folder into itself or its subfolder');
            return;
          }
          await api('/move', {
            method: 'POST',
            body: JSON.stringify({ type: item.type, from: item.path, to: targetFolder, name: item.name }),
          });
          toast(`Moved "${item.name}" into "${fEl.dataset.folderName}"`);
          changed();
        } catch (err) {
          toastError(err.message);
        }
      });
    });

    // Drop target on breadcrumbs (moving up)
    app.querySelectorAll('.crumbs a[data-crumb-path]').forEach(crumb => {
      crumb.addEventListener('dragover', (e) => {
        if (e.dataTransfer.types.includes('application/x-devlocker-item')) {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          crumb.classList.add('drag-over');
        }
      });
      crumb.addEventListener('dragleave', (e) => {
        if (!crumb.contains(e.relatedTarget)) {
          crumb.classList.remove('drag-over');
        }
      });
      crumb.addEventListener('drop', async (e) => {
        const raw = e.dataTransfer.getData('application/x-devlocker-item');
        if (!raw) return;
        e.preventDefault();
        e.stopPropagation();
        crumb.classList.remove('drag-over');
        try {
          const item = JSON.parse(raw);
          const targetFolder = JSON.parse(crumb.dataset.crumbPath);
          if (item.type === 'file' && targetFolder.length === 0) {
            toastError('Files cannot be moved to root');
            return;
          }
          if (item.type === 'folder' && targetFolder.length >= item.path.length &&
              item.path.every((p, i) => targetFolder[i] === p)) {
            toastError('Cannot move folder into itself');
            return;
          }
          await api('/move', {
            method: 'POST',
            body: JSON.stringify({ type: item.type, from: item.path, to: targetFolder, name: item.name }),
          });
          toast(`Moved "${item.name}"`);
          changed();
        } catch (err) {
          toastError(err.message);
        }
      });
    });
  }
}
document.addEventListener('click', () => { app.querySelectorAll('.menu').forEach(m => m.hidden = true); });

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
  document.title = 'Trash · DevLocker';
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

/* ---------- Word Document (.docx) & MHTML Processing Utilities ---------- */
function escXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colorToHex(col) {
  if (!col) return '';
  col = col.trim();
  if (col.startsWith('#')) {
    const hex = col.slice(1);
    return (hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex.slice(0, 6)).toUpperCase();
  }
  const m = col.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) {
    const r = Number(m[1]).toString(16).padStart(2, '0');
    const g = Number(m[2]).toString(16).padStart(2, '0');
    const b = Number(m[3]).toString(16).padStart(2, '0');
    return (r + g + b).toUpperCase();
  }
  return '';
}

function decodeQuotedPrintable(str) {
  const withoutSoftBreaks = str.replace(/=(?:\r\n|\n|\r)/g, '');
  const bytes = [];
  for (let i = 0; i < withoutSoftBreaks.length; i++) {
    const ch = withoutSoftBreaks[i];
    if (ch === '=' && i + 2 < withoutSoftBreaks.length && /^[0-9A-Fa-f]{2}$/.test(withoutSoftBreaks.slice(i + 1, i + 3))) {
      bytes.push(parseInt(withoutSoftBreaks.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      const code = withoutSoftBreaks.charCodeAt(i);
      if (code < 128) bytes.push(code);
      else {
        const enc = new TextEncoder().encode(ch);
        for (const b of enc) bytes.push(b);
      }
    }
  }
  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch {
    return withoutSoftBreaks.replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
}

function parseMhtml(mht) {
  if (!mht || typeof mht !== 'string') return null;
  let boundary = '';
  const bMatch = mht.match(/boundary=["']?([^"'\r\n;]+)/i);
  if (bMatch) boundary = bMatch[1].trim();
  else {
    const m = mht.match(/^--([^\r\n]+)/m);
    if (m) boundary = m[1].trim();
  }
  if (!boundary) return null;

  const parts = mht.split(new RegExp('--' + boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  let htmlBody = '';
  const images = new Map();

  for (const part of parts) {
    if (!part || part.trim() === '--' || part.trim() === '') continue;
    const splitIdx = part.search(/\r?\n\r?\n/);
    if (splitIdx === -1) continue;
    const headerBlock = part.slice(0, splitIdx);
    const bodyContent = part.slice(splitIdx).replace(/^\r?\n\r?\n/, '');

    const getHeader = (name) => {
      const regex = new RegExp('^' + name + ':[ \t]*(.*)$', 'im');
      const match = headerBlock.match(regex);
      return match ? match[1].trim() : '';
    };

    const contentType = (getHeader('Content-Type').split(';')[0] || '').toLowerCase().trim();
    const encoding = getHeader('Content-Transfer-Encoding').toLowerCase().trim();
    const location = getHeader('Content-Location').trim();
    const contentId = getHeader('Content-ID').replace(/[<>]/g, '').trim();

    if (contentType === 'text/html' || contentType === 'text/plain') {
      let decoded = bodyContent;
      if (encoding === 'quoted-printable') {
        decoded = decodeQuotedPrintable(decoded);
      } else if (encoding === 'base64') {
        try { decoded = atob(decoded.replace(/\s+/g, '')); } catch {}
      }
      if (!htmlBody || contentType === 'text/html') {
        htmlBody = decoded;
      }
    } else if (contentType.startsWith('image/') || encoding === 'base64' || /image\d+\./i.test(location)) {
      const mime = contentType.startsWith('image/') ? contentType : 'image/png';
      const cleanB64 = bodyContent.replace(/\s+/g, '');
      const dataUri = `data:${mime};base64,${cleanB64}`;
      if (location) {
        images.set(location, dataUri);
        const base = location.split('/').pop();
        if (base) images.set(base, dataUri);
      }
      if (contentId) {
        images.set('cid:' + contentId, dataUri);
        images.set(contentId, dataUri);
      }
    }
  }

  if (!htmlBody) return null;

  for (const [loc, uri] of images.entries()) {
    htmlBody = htmlBody.split(loc).join(uri);
  }

  const bodyMatch = htmlBody.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    htmlBody = bodyMatch[1];
  }

  return htmlBody.trim();
}

function cleanDocHtml(html) {
  if (!html || typeof html !== 'string') return '';
  if (!html.includes('mhtDocumentPart') && !html.includes('MIME-Version:') && !html.includes('Content-Location:')) {
    return html;
  }

  // 1. Try standard MHTML parsing if it has a boundary
  const parsed = parseMhtml(html);
  if (parsed && parsed.trim().length > 0 && !parsed.includes('mhtDocumentPart')) {
    return parsed;
  }

  // 2. Fallback: Parse embedded MIME boundaries inside HTML/paragraphs
  const imgRegex = /------=mhtDocumentPart[\s\S]*?Content-Type:\s*(image\/[a-zA-Z0-9+.-]+)[\s\S]*?Content-Transfer-Encoding:\s*base64[\s\S]*?(?:Content-Location:\s*([^\s<>"]+))?[\s\S]*?([A-Za-z0-9+/=]{60,})/gi;
  const extractedImages = [];
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    extractedImages.push({
      mime: m[1],
      loc: m[2] || '',
      b64: m[3].replace(/\s+/g, '')
    });
  }

  let cleaned = html
    .replace(/<p[^>]*>\s*MIME-Version:[^<]*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*------=mhtDocumentPart[^<]*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Content-Type:[^<]*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Content-Transfer-Encoding:[^<]*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Content-Location:[^<]*<\/p>/gi, '')
    .replace(/MIME-Version:\s*1\.0[^\n<>]*(?:Content-Type:[^\n<>]*)?/gi, '')
    .replace(/------=mhtDocumentPart[^\n<>]*/gi, '')
    .replace(/Content-Type:\s*text\/html[^\n<>]*/gi, '')
    .replace(/Content-Transfer-Encoding:\s*(?:quoted-printable|base64|7bit|8bit)[^\n<>]*/gi, '')
    .replace(/Content-Location:\s*file:\/\/\/[^\n<>]*/gi, '')
    .replace(/------=mhtDocumentPart--/gi, '');

  for (const img of extractedImages) {
    cleaned = cleaned.replace(img.b64, '');
  }

  cleaned = cleaned.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

  if (!cleaned.includes('<p>') && !cleaned.includes('<h1>') && !cleaned.includes('<div>')) {
    cleaned = cleaned.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => `<p>${l}</p>`).join('');
  }

  if (extractedImages.length > 0) {
    for (const img of extractedImages) {
      cleaned += `<p><img src="data:${img.mime};base64,${img.b64}" style="max-width:100%"></p>`;
    }
  }

  return cleaned.trim();
}

const getWrappedDocxHtml = (htmlContent) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111111; }
    h1 { font-size: 20pt; font-weight: bold; margin-bottom: 8pt; color: #1f4e79; }
    h2 { font-size: 15pt; font-weight: bold; margin-bottom: 6pt; color: #2e75b6; }
    h3 { font-size: 12.5pt; font-weight: bold; margin-bottom: 4pt; color: #5b9bd5; }
    p { margin: 0 0 8pt 0; }
    table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    td, th { border: 1px solid #c0c0c0; padding: 6pt 8pt; vertical-align: top; }
    th { background: #f2f5f9; font-weight: bold; color: #1f4e79; }
    blockquote { border-left: 3pt solid #2e75b6; padding-left: 10pt; margin: 8pt 0; color: #555555; font-style: italic; }
    hr { border: none; border-top: 1pt solid #d1d5db; margin: 12pt 0; }
    .word-callout { background: #f0f6ff; border-left: 4pt solid #185abd; padding: 8pt 12pt; margin: 10pt 0; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

async function generateStandardDocx(htmlContent) {
  if (!window.JSZip) {
    if (window.htmlDocx && typeof window.htmlDocx.asBlob === 'function') {
      return window.htmlDocx.asBlob(getWrappedDocxHtml(cleanDocHtml(htmlContent)));
    }
    throw new Error('ZIP library not ready');
  }

  const zip = new window.JSZip();
  const mediaFiles = [];
  let imgSeq = 0;

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanDocHtml(htmlContent), 'text/html');
  const body = doc.body;

  const imgEls = Array.from(body.querySelectorAll('img'));
  for (const img of imgEls) {
    const src = img.getAttribute('src') || '';
    if (!src) continue;
    try {
      let ext = 'png';
      let u8 = null;
      if (src.startsWith('data:image/')) {
        const match = src.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (match) {
          ext = match[1].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          if (ext === 'svg+xml') ext = 'svg';
          const b64 = match[2].replace(/\s+/g, '');
          const binStr = atob(b64);
          u8 = new Uint8Array(binStr.length);
          for (let i = 0; i < binStr.length; i++) u8[i] = binStr.charCodeAt(i);
        }
      } else if (src.startsWith('http') || src.startsWith('/')) {
        const res = await fetch(src);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          u8 = new Uint8Array(buf);
          const cType = res.headers.get('content-type') || '';
          if (cType.includes('jpeg') || src.includes('.jpg') || src.includes('.jpeg')) ext = 'jpg';
          else if (cType.includes('gif') || src.includes('.gif')) ext = 'gif';
          else if (cType.includes('webp') || src.includes('.webp')) ext = 'webp';
          else ext = 'png';
        }
      }

      if (u8) {
        imgSeq++;
        const relId = `rIdImg${imgSeq}`;
        const fileName = `image${imgSeq}.${ext}`;
        mediaFiles.push({ id: imgSeq, relId, fileName, ext, data: u8 });
        img.dataset.docxRelId = relId;
        img.dataset.docxExt = ext;
      }
    } catch (e) {
      console.warn('Failed to embed image:', e);
    }
  }

  function getRunPropertiesXml(fmt) {
    const rPr = [];
    if (fmt.bold) rPr.push('<w:b/><w:bCs/>');
    if (fmt.italic) rPr.push('<w:i/><w:iCs/>');
    if (fmt.underline) rPr.push('<w:u w:val="single"/>');
    if (fmt.strike) rPr.push('<w:strike/>');
    if (fmt.sub) rPr.push('<w:vertAlign w:val="subscript"/>');
    if (fmt.sup) rPr.push('<w:vertAlign w:val="superscript"/>');
    if (fmt.color) rPr.push(`<w:color w:val="${fmt.color}"/>`);
    if (fmt.highlight) rPr.push(`<w:highlight w:val="${fmt.highlight}"/>`);
    if (fmt.code) {
      rPr.push('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>');
      rPr.push('<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>');
    }
    if (fmt.fontFamily) rPr.push(`<w:rFonts w:ascii="${escXml(fmt.fontFamily)}" w:hAnsi="${escXml(fmt.fontFamily)}"/>`);
    if (fmt.fontSize) rPr.push(`<w:sz w:val="${fmt.fontSize}"/><w:szCs w:val="${fmt.fontSize}"/>`);
    return rPr.length > 0 ? `<w:rPr>${rPr.join('')}</w:rPr>` : '';
  }

  function buildDrawingXml(relId, widthPx = 480, heightPx = 320, picId = 1) {
    const emuPerPx = 9525;
    const cx = Math.max(95250, Math.round((Number(widthPx) || 480) * emuPerPx));
    const cy = Math.max(95250, Math.round((Number(heightPx) || 320) * emuPerPx));
    return `<w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="${cx}" cy="${cy}"/>
        <wp:docPr id="${picId}" name="Picture ${picId}"/>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="${picId}" name="Picture ${picId}"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${relId}"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm>
                  <a:off x="0" y="0"/>
                  <a:ext cx="${cx}" cy="${cy}"/>
                </a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>`;
  }

  function parseInlineRuns(node, parentFmt = {}) {
    let xml = '';
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        const txt = child.textContent;
        if (!txt) continue;
        const rPr = getRunPropertiesXml(parentFmt);
        xml += `<w:r>${rPr}<w:t xml:space="preserve">${escXml(txt)}</w:t></w:r>`;
      } else if (child.nodeType === 1) {
        const tag = child.tagName.toLowerCase();
        if (tag === 'br') {
          xml += '<w:r><w:br/></w:r>';
          continue;
        }
        if (tag === 'img') {
          const relId = child.dataset.docxRelId;
          if (relId) {
            const w = child.getAttribute('width') || child.naturalWidth || child.clientWidth || 500;
            const h = child.getAttribute('height') || child.naturalHeight || child.clientHeight || 350;
            xml += `<w:r>${buildDrawingXml(relId, w, h, imgSeq)}</w:r>`;
          }
          continue;
        }

        const childFmt = { ...parentFmt };
        if (['b', 'strong'].includes(tag) || (child.style && child.style.fontWeight === 'bold')) childFmt.bold = true;
        if (['i', 'em'].includes(tag) || (child.style && child.style.fontStyle === 'italic')) childFmt.italic = true;
        if (['u'].includes(tag) || (child.style && child.style.textDecoration && child.style.textDecoration.includes('underline'))) childFmt.underline = true;
        if (['s', 'strike', 'del'].includes(tag) || (child.style && child.style.textDecoration && child.style.textDecoration.includes('line-through'))) childFmt.strike = true;
        if (tag === 'sub') childFmt.sub = true;
        if (tag === 'sup') childFmt.sup = true;
        if (tag === 'code') childFmt.code = true;

        if (child.style && child.style.color) {
          const hex = colorToHex(child.style.color);
          if (hex) childFmt.color = hex;
        }
        if (child.getAttribute('color')) {
          const hex = colorToHex(child.getAttribute('color'));
          if (hex) childFmt.color = hex;
        }
        if (child.style && child.style.backgroundColor) {
          childFmt.highlight = 'yellow';
        }

        xml += parseInlineRuns(child, childFmt);
      }
    }
    return xml;
  }

  function getAlignment(el) {
    if (!el || !el.style) return '';
    const align = (el.style.textAlign || el.getAttribute('align') || '').toLowerCase();
    if (align === 'center') return '<w:jc w:val="center"/>';
    if (align === 'right') return '<w:jc w:val="right"/>';
    if (align === 'justify') return '<w:jc w:val="both"/>';
    return '';
  }

  let bodyXml = '';

  function processBlockNode(node) {
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      if (text) {
        bodyXml += `<w:p><w:r><w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p>`;
      }
      return;
    }
    if (node.nodeType !== 1) return;

    const tag = node.tagName.toLowerCase();

    // Headings
    if (/^h[1-6]$/.test(tag)) {
      const level = tag[1];
      const styleId = `Heading${level <= 3 ? level : 3}`;
      const align = getAlignment(node);
      const runs = parseInlineRuns(node);
      bodyXml += `<w:p><w:pPr><w:pStyle w:val="${styleId}"/>${align}</w:pPr>${runs}</w:p>`;
      return;
    }

    // Callout / Blockquote
    if (tag === 'blockquote' || node.classList.contains('word-callout')) {
      const runs = parseInlineRuns(node);
      bodyXml += `<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="24" w:space="12" w:color="185ABD"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F0F6FF"/><w:ind w:left="360" w:right="360"/></w:pPr>${runs}</w:p>`;
      return;
    }

    // Lists
    if (tag === 'ul' || tag === 'ol') {
      const isOrdered = tag === 'ol';
      const items = Array.from(node.children).filter(c => c.tagName.toLowerCase() === 'li');
      items.forEach((li, idx) => {
        const bulletSymbol = isOrdered ? `${idx + 1}.\t` : '•\t';
        const runs = parseInlineRuns(li);
        bodyXml += `<w:p><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr><w:t xml:space="preserve">${escXml(bulletSymbol)}</w:t></w:r>${runs}</w:p>`;
      });
      return;
    }

    // Horizontal Rule
    if (tag === 'hr') {
      bodyXml += '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CCCCCC"/></w:pBdr></w:pPr></w:p>';
      return;
    }

    // Table
    if (tag === 'table') {
      let tblXml = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/><w:left w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/><w:right w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="E5E5E5"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="E5E5E5"/></w:tblBorders></w:tblPr>';
      const rows = Array.from(node.querySelectorAll('tr'));
      for (const row of rows) {
        tblXml += '<w:tr>';
        const cells = Array.from(row.querySelectorAll('th, td'));
        for (const cell of cells) {
          const isHeader = cell.tagName.toLowerCase() === 'th';
          const tcShd = isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : '';
          const tcAlign = getAlignment(cell);
          const runs = parseInlineRuns(cell, isHeader ? { bold: true } : {});
          tblXml += `<w:tc><w:tcPr>${tcShd}<w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr>${tcAlign}</w:pPr>${runs || '<w:r><w:t></w:t></w:r>'}</w:p></w:tc>`;
        }
        tblXml += '</w:tr>';
      }
      tblXml += '</w:tbl>';
      bodyXml += tblXml;
      return;
    }

    // Standalone Image
    if (tag === 'img') {
      const relId = node.dataset.docxRelId;
      if (relId) {
        const w = node.getAttribute('width') || node.naturalWidth || node.clientWidth || 500;
        const h = node.getAttribute('height') || node.naturalHeight || node.clientHeight || 350;
        bodyXml += `<w:p><w:r>${buildDrawingXml(relId, w, h, imgSeq)}</w:r></w:p>`;
      }
      return;
    }

    // Paragraph or generic block
    const align = getAlignment(node);
    const runs = parseInlineRuns(node);
    if (runs || align) {
      bodyXml += `<w:p><w:pPr>${align}</w:pPr>${runs}</w:p>`;
    } else {
      Array.from(node.childNodes).forEach(processBlockNode);
    }
  }

  Array.from(body.childNodes).forEach(processBlockNode);

  if (!bodyXml) {
    bodyXml = '<w:p><w:r><w:t></w:t></w:r></w:p>';
  }

  const sectPr = `<w:sectPr>
    <w:pgSz w:w="12240" w:h="15840"/>
    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    <w:cols w:space="720"/>
    <w:docGrid w:linePitch="360"/>
  </w:sectPr>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
    ${sectPr}
  </w:body>
</w:document>`;

  let docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;
  for (const media of mediaFiles) {
    docRelsXml += `\n  <Relationship Id="${media.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${media.fileName}"/>`;
  }
  docRelsXml += '\n</Relationships>';

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="gif" ContentType="image/gif"/>
  <Default Extension="webp" ContentType="image/webp"/>
  <Default Extension="svg" ContentType="image/svg+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="276" w:lineRule="auto" w:after="160"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="360" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/>
      <w:color w:val="1F4E79"/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="240" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/>
      <w:color w:val="2E75B6"/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="160" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/>
      <w:color w:val="5B9BD5"/>
      <w:sz w:val="24"/>
      <w:szCs w:val="24"/>
    </w:rPr>
  </w:style>
  <w:style w:type="table" w:default="1" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E5E5E5"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E5E5E5"/>
      </w:tblBorders>
    </w:tblPr>
  </w:style>
</w:styles>`;

  zip.file('_rels/.rels', rootRelsXml);
  zip.file('[Content_Types].xml', contentTypesXml);
  zip.file('word/_rels/document.xml.rels', docRelsXml);
  zip.file('word/styles.xml', stylesXml);
  zip.file('word/document.xml', documentXml);

  for (const media of mediaFiles) {
    zip.file(`word/media/${media.fileName}`, media.data);
  }

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

async function readDocFile(arrayBuffer, fileName = '') {
  const u8 = new Uint8Array(arrayBuffer);
  const isZip = u8[0] === 0x50 && u8[1] === 0x4b;

  if (isZip) {
    if (window.JSZip) {
      try {
        const zip = await window.JSZip.loadAsync(arrayBuffer);
        const mhtPath = Object.keys(zip.files).find(p => /(?:afchunk|altchunk|\.mht$)/i.test(p));
        if (mhtPath) {
          const mhtStr = await zip.files[mhtPath].async('string');
          const parsed = parseMhtml(mhtStr);
          if (parsed && parsed.trim().length > 0) {
            return { type: 'html', html: cleanDocHtml(parsed), source: 'mhtml-chunk' };
          }
        }

        const docXmlEntry = zip.files['word/document.xml'];
        if (docXmlEntry) {
          const docXml = await docXmlEntry.async('string');
          if (docXml.includes('w:altChunk') && !docXml.includes('<w:p>') && !docXml.includes('<w:p ')) {
            for (const path of Object.keys(zip.files)) {
              if (path.startsWith('word/') && (path.endsWith('.mht') || path.endsWith('.htm') || path.endsWith('.html'))) {
                const chunkStr = await zip.files[path].async('string');
                const html = parseMhtml(chunkStr) || chunkStr;
                if (html && html.trim().length > 0) {
                  return { type: 'html', html: cleanDocHtml(html), source: 'altchunk-file' };
                }
              }
            }
          }
        }
      } catch (zipErr) {
        console.warn('JSZip reading error:', zipErr);
      }
    }

    if (window.mammoth && typeof window.mammoth.convertToHtml === 'function') {
      try {
        const res = await window.mammoth.convertToHtml({ arrayBuffer });
        if (res && res.value && res.value.trim().length > 0) {
          return { type: 'openxml', html: cleanDocHtml(res.value), rawBuffer: arrayBuffer, source: 'mammoth' };
        }
      } catch (mammothErr) {
        console.warn('Mammoth conversion error:', mammothErr);
      }
    }

    return { type: 'openxml', html: '', rawBuffer: arrayBuffer, source: 'openxml-zip' };
  }

  let text = '';
  try {
    text = new TextDecoder('utf-8', { fatal: false }).decode(u8);
  } catch {}

  if (text && (text.includes('MIME-Version:') || text.includes('mhtDocumentPart') || text.includes('multipart/related'))) {
    const parsed = cleanDocHtml(text);
    if (parsed && parsed.trim().length > 0) {
      return { type: 'html', html: parsed, source: 'raw-mhtml' };
    }
  }

  const textRuns = extractDocStrings(u8);
  const cleanRuns = textRuns.filter(r => {
    if (/^MIME-Version:/i.test(r)) return false;
    if (/^------=mhtDocumentPart/i.test(r)) return false;
    if (/^Content-(?:Type|Transfer-Encoding|Location):/i.test(r)) return false;
    if (/^[A-Za-z0-9+/=]{40,}$/.test(r)) return false;
    return true;
  });

  return {
    type: 'legacy',
    textRuns: cleanRuns,
    html: cleanRuns.map(p => `<p>${esc(p)}</p>`).join(''),
    source: 'legacy-doc'
  };
}

/* ---------- Word Document (.docx) Editor ---------- */
async function openDocEditor(existing = null, initialHtml = '') {
  const folder = state.path;
  const isLegacyDoc = existing && ext(existing) === 'doc';
  let defaultName = existing || 'Document.docx';
  if (isLegacyDoc) defaultName = defaultName.replace(/\.doc$/i, '.docx');

  let currentZoom = 100;
  let isFullscreen = false;
  let isDirty = false;
  let cleanupListeners = null;

  const m = modal({
    wide: true,
    extraClass: 'ms-word-modal',
    noHead: true,
    onClose: () => cleanupListeners?.(),
    body: `
      <div class="ms-word-app">
        <!-- Word Title Bar -->
        <div class="word-titlebar">
          <div class="word-titlebar-left">
            <div class="word-app-badge" title="Microsoft Word (.docx)">
              ${icon('word')}
              <span class="word-brand-name">Word</span>
            </div>
            <div class="word-filename-wrap">
              <input class="word-filename-input doc-editor-name" type="text" value="${esc(defaultName)}" placeholder="Document.docx" spellcheck="false" title="Click to rename document">
              <span class="word-status-pill" id="wordSaveStatus" title="Save status">
                ${icon('check')} <span>Saved</span>
              </span>
            </div>
          </div>
          <div class="word-titlebar-center">
            <div class="word-quick-tools">
              <button class="word-quick-btn" data-cmd="undo" title="Undo (Ctrl+Z)">${icon('undo')}</button>
              <button class="word-quick-btn" data-cmd="redo" title="Redo (Ctrl+Y)">${icon('redo')}</button>
              <button class="word-quick-btn" data-act="quick-save" title="Save Document (Ctrl+S)">${icon('save')}</button>
            </div>
          </div>
          <div class="word-titlebar-right">
            <button class="word-action-btn" data-act="download" title="Export .docx to your device">${icon('download')} <span>Download</span></button>
            <button class="word-action-btn primary" data-save title="Save to DevLocker (Ctrl+S)">${icon('save')} <span>Save</span></button>
            <button class="word-titlebar-icon-btn" data-act="fullscreen" title="Toggle Fullscreen">${icon('maximize')}</button>
            <button class="word-titlebar-icon-btn close-btn" data-cancel title="Close">${icon('close')}</button>
          </div>
        </div>

        <!-- Ribbon Tabs Bar -->
        <div class="word-ribbon-tabs">
          <div class="word-tabs-list">
            <button class="word-tab-btn active" data-tab="home">Home</button>
            <button class="word-tab-btn" data-tab="insert">Insert</button>
            <button class="word-tab-btn" data-tab="layout">Layout</button>
            <button class="word-tab-btn" data-tab="view">View</button>
          </div>
        </div>

        <!-- Ribbon Panels -->
        <div class="word-ribbon-panel">
          <!-- HOME TAB -->
          <div class="word-ribbon-content active" id="tab-home">
            <div class="word-ribbon-group">
              <div class="word-group-row">
                <button class="word-tool-btn" data-cmd="undo" title="Undo (Ctrl+Z)">${icon('undo')}</button>
                <button class="word-tool-btn" data-cmd="redo" title="Redo (Ctrl+Y)">${icon('redo')}</button>
              </div>
              <div class="word-group-label">Undo</div>
            </div>
            <div class="word-ribbon-divider"></div>

            <div class="word-ribbon-group">
              <div class="word-group-row">
                <select class="word-select word-font-family" data-act="fontFamily" title="Font Family">
                  <option value="Calibri" selected>Calibri</option>
                  <option value="Carlito">Carlito</option>
                  <option value="Aptos">Aptos</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Segoe UI">Segoe UI</option>
                  <option value="Georgia">Georgia</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                </select>
                <select class="word-select word-font-size" data-act="fontSize" title="Font Size">
                  <option value="8pt">8</option>
                  <option value="9pt">9</option>
                  <option value="10pt">10</option>
                  <option value="11pt" selected>11</option>
                  <option value="12pt">12</option>
                  <option value="14pt">14</option>
                  <option value="16pt">16</option>
                  <option value="18pt">18</option>
                  <option value="20pt">20</option>
                  <option value="24pt">24</option>
                  <option value="28pt">28</option>
                  <option value="36pt">36</option>
                  <option value="48pt">48</option>
                </select>
                <button class="word-tool-btn font-stepper" data-act="growFont" title="Increase Font Size">A<span class="stepper-arrow">▲</span></button>
                <button class="word-tool-btn font-stepper" data-act="shrinkFont" title="Decrease Font Size">A<span class="stepper-arrow">▼</span></button>
                <div class="word-mini-divider"></div>
                <button class="word-tool-btn" data-cmd="removeFormat" title="Clear Formatting">${icon('clear')}</button>
              </div>
              <div class="word-group-row">
                <button class="word-tool-btn check-state" data-cmd="bold" title="Bold (Ctrl+B)">${icon('bold')}</button>
                <button class="word-tool-btn check-state" data-cmd="italic" title="Italic (Ctrl+I)">${icon('italic')}</button>
                <button class="word-tool-btn check-state" data-cmd="underline" title="Underline (Ctrl+U)">${icon('underline')}</button>
                <button class="word-tool-btn check-state" data-cmd="strikeThrough" title="Strikethrough">${icon('strikethrough')}</button>
                <button class="word-tool-btn check-state" data-cmd="subscript" title="Subscript">${icon('subscript')}</button>
                <button class="word-tool-btn check-state" data-cmd="superscript" title="Superscript">${icon('superscript')}</button>
                <div class="word-mini-divider"></div>
                <div class="word-dropdown-wrap">
                  <button class="word-tool-btn word-color-btn" data-dropdown="textColor" title="Font Color">
                    ${icon('textColor')}
                  </button>
                  <div class="word-popover word-palette" id="popover-textColor" hidden>
                    <div class="palette-header">Font Color</div>
                    <div class="palette-grid">
                      <button class="color-dot" data-color="#111827" style="background:#111827" title="Automatic / Black"></button>
                      <button class="color-dot" data-color="#185abd" style="background:#185abd" title="Word Blue"></button>
                      <button class="color-dot" data-color="#1f4e79" style="background:#1f4e79" title="Dark Navy"></button>
                      <button class="color-dot" data-color="#dc2626" style="background:#dc2626" title="Dark Red"></button>
                      <button class="color-dot" data-color="#ea580c" style="background:#ea580c" title="Orange"></button>
                      <button class="color-dot" data-color="#16a34a" style="background:#16a34a" title="Green"></button>
                      <button class="color-dot" data-color="#7c3aed" style="background:#7c3aed" title="Purple"></button>
                      <button class="color-dot" data-color="#4b5563" style="background:#4b5563" title="Gray"></button>
                    </div>
                    <div class="palette-custom">
                      <label>Custom: <input type="color" id="customTextColor" value="#185abd"></label>
                    </div>
                  </div>
                </div>
                <div class="word-dropdown-wrap">
                  <button class="word-tool-btn word-color-btn" data-dropdown="hiliteColor" title="Text Highlight Color">
                    ${icon('highlighter')}
                  </button>
                  <div class="word-popover word-palette" id="popover-hiliteColor" hidden>
                    <div class="palette-header">Highlight Color</div>
                    <div class="palette-grid">
                      <button class="color-dot" data-hilite="#fef08a" style="background:#fef08a" title="Yellow"></button>
                      <button class="color-dot" data-hilite="#bbf7d0" style="background:#bbf7d0" title="Bright Green"></button>
                      <button class="color-dot" data-hilite="#a5f3fc" style="background:#a5f3fc" title="Turquoise"></button>
                      <button class="color-dot" data-hilite="#fbcfe8" style="background:#fbcfe8" title="Pink"></button>
                      <button class="color-dot" data-hilite="#fed7aa" style="background:#fed7aa" title="Orange"></button>
                      <button class="color-dot" data-hilite="#e5e7eb" style="background:#e5e7eb" title="Gray"></button>
                      <button class="color-dot dot-clear" data-hilite="transparent" title="No Color">∅</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="word-group-label">Font</div>
            </div>
            <div class="word-ribbon-divider"></div>

            <div class="word-ribbon-group">
              <div class="word-group-row">
                <button class="word-tool-btn check-state" data-cmd="insertUnorderedList" title="Bullets">${icon('listUl')}</button>
                <button class="word-tool-btn check-state" data-cmd="insertOrderedList" title="Numbering">${icon('listOl')}</button>
                <button class="word-tool-btn" data-cmd="outdent" title="Decrease Indent">${icon('outdent')}</button>
                <button class="word-tool-btn" data-cmd="indent" title="Increase Indent">${icon('indent')}</button>
                <div class="word-mini-divider"></div>
                <select class="word-select word-line-height" data-act="lineSpacing" title="Line Spacing">
                  <option value="1.0">1.0</option>
                  <option value="1.15">1.15</option>
                  <option value="1.5" selected>1.5</option>
                  <option value="2.0">2.0</option>
                </select>
              </div>
              <div class="word-group-row">
                <button class="word-tool-btn check-state" data-cmd="justifyLeft" title="Align Left">${icon('alignLeft')}</button>
                <button class="word-tool-btn check-state" data-cmd="justifyCenter" title="Center">${icon('alignCenter')}</button>
                <button class="word-tool-btn check-state" data-cmd="justifyRight" title="Align Right">${icon('alignRight')}</button>
                <button class="word-tool-btn check-state" data-cmd="justifyFull" title="Justify">${icon('alignJustify')}</button>
                <div class="word-mini-divider"></div>
                <button class="word-tool-btn" data-act="insertChecklist" title="Checklist item">☑</button>
                <button class="word-tool-btn" data-act="insertQuote" title="Quote block">${icon('quote')}</button>
              </div>
              <div class="word-group-label">Paragraph</div>
            </div>
            <div class="word-ribbon-divider"></div>

            <!-- MS Word Quick Styles Gallery -->
            <div class="word-ribbon-group word-styles-box">
              <div class="word-styles-gallery">
                <button class="word-style-card active" data-style="p" title="Normal text">
                  <span class="style-preview">AaBbCc</span>
                  <span class="style-name">Normal</span>
                </button>
                <button class="word-style-card" data-style="h1" title="Heading 1">
                  <span class="style-preview h1">AaBbCc</span>
                  <span class="style-name">Heading 1</span>
                </button>
                <button class="word-style-card" data-style="h2" title="Heading 2">
                  <span class="style-preview h2">AaBbCc</span>
                  <span class="style-name">Heading 2</span>
                </button>
                <button class="word-style-card" data-style="h3" title="Heading 3">
                  <span class="style-preview h3">AaBbCc</span>
                  <span class="style-name">Heading 3</span>
                </button>
                <button class="word-style-card" data-style="blockquote" title="Quote">
                  <span class="style-preview quote">“Quote”</span>
                  <span class="style-name">Quote</span>
                </button>
              </div>
              <div class="word-group-label">Styles</div>
            </div>
          </div>

          <!-- INSERT TAB -->
          <div class="word-ribbon-content" id="tab-insert" hidden>
            <div class="word-ribbon-group">
              <div class="word-group-row">
                <button class="word-large-btn" data-act="insertTable3x3" title="Insert 3x3 Table">
                  ${icon('table')}
                  <span>Table 3×3</span>
                </button>
                <button class="word-large-btn" data-act="insertTable4x4" title="Insert 4x4 Table">
                  ${icon('table')}
                  <span>Table 4×4</span>
                </button>
                <div class="word-mini-divider"></div>
                <div class="word-subgroup-col">
                  <button class="word-small-row-btn" data-act="tableAddRow" title="Add row to active table">+ Row Below</button>
                  <button class="word-small-row-btn" data-act="tableAddCol" title="Add column to active table">+ Column Right</button>
                </div>
                <div class="word-subgroup-col">
                  <button class="word-small-row-btn danger" data-act="tableDelRow" title="Delete current row">− Delete Row</button>
                  <button class="word-small-row-btn danger" data-act="tableDelCol" title="Delete current column">− Delete Column</button>
                </div>
              </div>
              <div class="word-group-label">Tables</div>
            </div>
            <div class="word-ribbon-divider"></div>

            <div class="word-ribbon-group">
              <div class="word-group-row">
                <button class="word-large-btn" data-act="insertLink" title="Insert Web Link">
                  ${icon('link')}
                  <span>Link</span>
                </button>
                <button class="word-large-btn" data-act="insertDivider" title="Insert Horizontal Rule">
                  ${icon('horizontalRule')}
                  <span>Divider</span>
                </button>
                <button class="word-large-btn" data-act="insertCallout" title="Insert Callout Note">
                  ${icon('callout')}
                  <span>Callout Note</span>
                </button>
                <button class="word-large-btn" data-act="insertDate" title="Insert Current Date">
                  ${icon('calendar')}
                  <span>Date &amp; Time</span>
                </button>
              </div>
              <div class="word-group-label">Elements</div>
            </div>
            <div class="word-ribbon-divider"></div>

            <div class="word-ribbon-group">
              <div class="word-symbols-grid">
                <button class="word-symbol-btn" data-sym="©" title="Copyright">©</button>
                <button class="word-symbol-btn" data-sym="®" title="Registered">®</button>
                <button class="word-symbol-btn" data-sym="™" title="Trademark">™</button>
                <button class="word-symbol-btn" data-sym="•" title="Bullet">•</button>
                <button class="word-symbol-btn" data-sym="—" title="Em Dash">—</button>
                <button class="word-symbol-btn" data-sym="→" title="Right Arrow">→</button>
                <button class="word-symbol-btn" data-sym="±" title="Plus-Minus">±</button>
                <button class="word-symbol-btn" data-sym="✓" title="Checkmark">✓</button>
                <button class="word-symbol-btn" data-sym="★" title="Star">★</button>
                <button class="word-symbol-btn" data-sym="℃" title="Celsius">℃</button>
              </div>
              <div class="word-group-label">Symbols</div>
            </div>
          </div>

          <!-- LAYOUT TAB -->
          <div class="word-ribbon-content" id="tab-layout" hidden>
            <div class="word-ribbon-group">
              <div class="word-group-row">
                <button class="word-large-btn active-margin" data-act="setMargin" data-val="normal" title="1 inch margins">
                  ${icon('margins')}
                  <span>Normal (1")</span>
                </button>
                <button class="word-large-btn active-margin" data-act="setMargin" data-val="narrow" title="0.5 inch margins">
                  ${icon('marginsNarrow')}
                  <span>Narrow (0.5")</span>
                </button>
                <button class="word-large-btn active-margin" data-act="setMargin" data-val="wide" title="1.5 inch margins">
                  ${icon('marginsWide')}
                  <span>Wide (1.5")</span>
                </button>
              </div>
              <div class="word-group-label">Margins</div>
            </div>
            <div class="word-ribbon-divider"></div>

            <div class="word-ribbon-group">
              <div class="word-group-row">
                <button class="word-large-btn active-width" data-act="setWidth" data-val="standard" title="Standard A4 / Letter width">
                  ${icon('pageLayout')}
                  <span>Standard A4</span>
                </button>
                <button class="word-large-btn active-width" data-act="setWidth" data-val="wide" title="Full workspace width">
                  ${icon('fullScreen')}
                  <span>Full Width</span>
                </button>
              </div>
              <div class="word-group-label">Page Width</div>
            </div>
          </div>

          <!-- VIEW TAB -->
          <div class="word-ribbon-content" id="tab-view" hidden>
            <div class="word-ribbon-group">
              <div class="word-group-row" style="padding: 10px 4px; gap: 16px;">
                <label class="word-toggle-label">
                  <input type="checkbox" id="toggleRulerCheck" checked>
                  <span>Horizontal Ruler</span>
                </label>
                <label class="word-toggle-label">
                  <input type="checkbox" id="toggleShadowCheck" checked>
                  <span>Page Drop Shadow</span>
                </label>
              </div>
              <div class="word-group-label">Show / Hide</div>
            </div>
            <div class="word-ribbon-divider"></div>

            <div class="word-ribbon-group">
              <div class="word-group-row" style="padding: 10px 4px; gap: 8px;">
                <button class="word-tool-btn" data-act="zoomOut" title="Zoom Out">${icon('zoomOut')}</button>
                <span class="word-zoom-readout" id="viewZoomText">100%</span>
                <button class="word-tool-btn" data-act="zoomIn" title="Zoom In">${icon('zoomIn')}</button>
                <button class="word-small-row-btn" data-act="zoomReset" title="Reset Zoom to 100%">Reset 100%</button>
              </div>
              <div class="word-group-label">Zoom</div>
            </div>
          </div>
        </div>

        <!-- MS Word Horizontal Ruler -->
        <div class="word-ruler-bar" id="wordRulerBar">
          <div class="word-ruler-track" id="wordRulerTrack">
            <div class="word-ruler-margin-left">
              <div class="word-ruler-marker top-indent" title="First Line Indent"></div>
              <div class="word-ruler-marker hanging-indent" title="Left Indent"></div>
            </div>
            <div class="word-ruler-body">
              <span class="ruler-inch" style="left:0%"><span class="ruler-num">1</span></span>
              <span class="ruler-inch" style="left:14.28%"><span class="ruler-num">2</span></span>
              <span class="ruler-inch" style="left:28.57%"><span class="ruler-num">3</span></span>
              <span class="ruler-inch" style="left:42.85%"><span class="ruler-num">4</span></span>
              <span class="ruler-inch" style="left:57.14%"><span class="ruler-num">5</span></span>
              <span class="ruler-inch" style="left:71.42%"><span class="ruler-num">6</span></span>
              <span class="ruler-inch" style="left:85.71%"><span class="ruler-num">7</span></span>
              <span class="ruler-inch" style="left:100%"><span class="ruler-num">8</span></span>
            </div>
            <div class="word-ruler-margin-right">
              <div class="word-ruler-marker right-margin" title="Right Margin"></div>
            </div>
          </div>
        </div>

        <!-- Document Canvas & Word Paper -->
        <div class="word-canvas-scroll doc-editor-scroll">
          <div class="word-paper-container" id="wordPaperContainer">
            <div class="doc-editor-paper word-paper" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true">
              <div class="spin">Loading document…</div>
            </div>
          </div>
        </div>

        <!-- MS Word Status Bar -->
        <div class="word-statusbar">
          <div class="word-statusbar-left">
            <span class="word-status-item" id="wordPageStat">Page 1 of 1</span>
            <span class="word-status-sep">|</span>
            <span class="word-status-item doc-stats" id="wordWordStat">0 words · 0 characters</span>
            <span class="word-status-sep">|</span>
            <span class="word-status-item">English (US)</span>
            <span class="word-status-sep">|</span>
            <span class="word-status-item" title="Proofing">${icon('check')} <span style="margin-left:2px">No errors</span></span>
          </div>
          <div class="word-statusbar-center">
            <span class="word-status-item" id="wordStatusDetail">DevLocker Word Editor</span>
          </div>
          <div class="word-statusbar-right">
            <span class="word-view-icon active" title="Print Layout View">${icon('pageLayout')}</span>
            <div class="word-zoom-box">
              <button class="word-zoom-step" data-act="zoomOut" title="Zoom Out">−</button>
              <span class="word-zoom-num" id="statusZoomNum">100%</span>
              <button class="word-zoom-step" data-act="zoomIn" title="Zoom In">+</button>
            </div>
          </div>
        </div>
      </div>`,
  });

  const paper = $('.doc-editor-paper', m.el);
  const nameIn = $('.doc-editor-name', m.el);

  // Enable CSS styling for commands where available
  try { document.execCommand('styleWithCSS', false, true); } catch {}

  const updateStats = () => {
    const text = paper.innerText || '';
    const words = (text.trim().match(/\S+/g) || []).length;
    const chars = text.length;
    const estPages = Math.max(1, Math.ceil(words / 450));
    const pStat = $('#wordPageStat', m.el);
    const wStat = $('#wordWordStat', m.el);
    if (pStat) pStat.textContent = `Page 1 of ${estPages}`;
    if (wStat) wStat.textContent = `${plural(words, 'word')} · ${plural(chars, 'character')}`;
  };

  const markDirty = () => {
    if (!isDirty) {
      isDirty = true;
      const st = $('#wordSaveStatus', m.el);
      if (st) {
        st.className = 'word-status-pill dirty';
        st.innerHTML = '● <span>Unsaved changes</span>';
      }
    }
    updateStats();
  };
  paper.addEventListener('input', markDirty);

  // Synchronize ribbon active buttons with current selection
  const syncActiveStates = () => {
    m.el.querySelectorAll('.check-state[data-cmd]').forEach(btn => {
      const cmd = btn.dataset.cmd;
      try {
        const active = document.queryCommandState(cmd);
        btn.classList.toggle('active', !!active);
      } catch {}
    });

    const alignCommands = ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];
    alignCommands.forEach(cmd => {
      const btn = $(`[data-cmd="${cmd}"]`, m.el);
      if (btn) {
        try {
          btn.classList.toggle('active', !!document.queryCommandState(cmd));
        } catch {}
      }
    });

    // Sync styles cards
    let parentBlock = 'p';
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node = sel.getRangeAt(0).startContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      while (node && node !== paper) {
        const tag = node.tagName?.toLowerCase();
        if (['h1', 'h2', 'h3', 'blockquote', 'p'].includes(tag)) {
          parentBlock = tag;
          break;
        }
        node = node.parentNode;
      }
    }
    m.el.querySelectorAll('.word-style-card').forEach(card => {
      card.classList.toggle('active', card.dataset.style === parentBlock);
    });
  };

  const onSelectionChange = () => {
    if (document.activeElement === paper || paper.contains(document.activeElement)) {
      syncActiveStates();
    }
  };
  document.addEventListener('selectionchange', onSelectionChange);
  paper.addEventListener('keyup', syncActiveStates);
  paper.addEventListener('mouseup', syncActiveStates);

  // Ribbon Tab switching
  m.el.querySelectorAll('.word-tab-btn').forEach(tab => {
    tab.onclick = () => {
      m.el.querySelectorAll('.word-tab-btn').forEach(t => t.classList.remove('active'));
      m.el.querySelectorAll('.word-ribbon-content').forEach(p => { p.hidden = true; p.classList.remove('active'); });
      tab.classList.add('active');
      const panel = $(`#tab-${tab.dataset.tab}`, m.el);
      if (panel) {
        panel.hidden = false;
        panel.classList.add('active');
      }
    };
  });

  // Standard commands
  m.el.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.execCommand(btn.dataset.cmd, false, null);
      paper.focus();
      markDirty();
      syncActiveStates();
    });
  });

  // Styles gallery
  m.el.querySelectorAll('.word-style-card').forEach(card => {
    card.onclick = (e) => {
      e.preventDefault();
      const style = card.dataset.style;
      document.execCommand('formatBlock', false, `<${style}>`);
      paper.focus();
      markDirty();
      syncActiveStates();
    };
  });

  // Font family selector
  const fontSelect = $('.word-font-family', m.el);
  if (fontSelect) {
    fontSelect.onchange = () => {
      document.execCommand('fontName', false, fontSelect.value);
      paper.focus();
      markDirty();
    };
  }

  // Font size selector & steppers
  const setFontSize = (sizeStr) => {
    document.execCommand('fontSize', false, '7');
    const fonts = paper.querySelectorAll('font[size="7"]');
    fonts.forEach(f => {
      f.removeAttribute('size');
      f.style.fontSize = sizeStr;
    });
    paper.focus();
    markDirty();
  };

  const sizeSelect = $('.word-font-size', m.el);
  if (sizeSelect) {
    sizeSelect.onchange = () => setFontSize(sizeSelect.value);
  }

  const FONT_SIZES = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '36pt', '48pt'];
  const stepFont = (delta) => {
    let curIdx = FONT_SIZES.indexOf(sizeSelect.value);
    if (curIdx === -1) curIdx = 3;
    const nextIdx = Math.max(0, Math.min(FONT_SIZES.length - 1, curIdx + delta));
    sizeSelect.value = FONT_SIZES[nextIdx];
    setFontSize(FONT_SIZES[nextIdx]);
  };
  $('[data-act="growFont"]', m.el).onclick = () => stepFont(1);
  $('[data-act="shrinkFont"]', m.el).onclick = () => stepFont(-1);

  // Line spacing
  const lineSelect = $('.word-line-height', m.el);
  if (lineSelect) {
    lineSelect.onchange = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        let node = sel.getRangeAt(0).startContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        while (node && node !== paper) {
          if (['P', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'LI'].includes(node.tagName)) {
            node.style.lineHeight = lineSelect.value;
            break;
          }
          node = node.parentNode;
        }
      }
      paper.focus();
      markDirty();
    };
  }

  // Color Dropdowns (Font Color & Highlight Color)
  m.el.querySelectorAll('[data-dropdown]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const name = btn.dataset.dropdown;
      const pop = $(`#popover-${name}`, m.el);
      const wasHidden = pop.hidden;
      m.el.querySelectorAll('.word-popover').forEach(p => p.hidden = true);
      pop.hidden = !wasHidden;
    };
  });

  m.el.querySelectorAll('[data-color]').forEach(dot => {
    dot.onclick = () => {
      document.execCommand('foreColor', false, dot.dataset.color);
      $('#popover-textColor', m.el).hidden = true;
      paper.focus();
      markDirty();
    };
  });

  const customColorInput = $('#customTextColor', m.el);
  if (customColorInput) {
    customColorInput.onchange = () => {
      document.execCommand('foreColor', false, customColorInput.value);
      $('#popover-textColor', m.el).hidden = true;
      paper.focus();
      markDirty();
    };
  }

  m.el.querySelectorAll('[data-hilite]').forEach(dot => {
    dot.onclick = () => {
      const color = dot.dataset.hilite;
      if (color === 'transparent') {
        document.execCommand('removeFormat', false, null);
      } else {
        document.execCommand('hiliteColor', false, color);
      }
      $('#popover-hiliteColor', m.el).hidden = true;
      paper.focus();
      markDirty();
    };
  });

  const hidePopovers = () => m.el.querySelectorAll('.word-popover').forEach(p => p.hidden = true);
  document.addEventListener('click', hidePopovers);

  // Insert Tab Actions: Tables
  const createTableHtml = (rows, cols) => {
    let h = '<table class="word-table"><thead><tr>';
    for (let c = 1; c <= cols; c++) h += `<th>Header ${c}</th>`;
    h += '</tr></thead><tbody>';
    for (let r = 1; r < rows; r++) {
      h += '<tr>';
      for (let c = 1; c <= cols; c++) h += `<td>Row ${r} Col ${c}</td>`;
      h += '</tr>';
    }
    h += '</tbody></table><p><br></p>';
    return h;
  };

  $('[data-act="insertTable3x3"]', m.el).onclick = () => {
    document.execCommand('insertHTML', false, createTableHtml(3, 3));
    paper.focus();
    markDirty();
  };
  $('[data-act="insertTable4x4"]', m.el).onclick = () => {
    document.execCommand('insertHTML', false, createTableHtml(4, 4));
    paper.focus();
    markDirty();
  };

  const getTableContext = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    let node = sel.getRangeAt(0).startContainer;
    let cell = null, row = null, table = null;
    while (node && node !== paper) {
      if (node.tagName === 'TD' || node.tagName === 'TH') cell = node;
      if (node.tagName === 'TR') row = node;
      if (node.tagName === 'TABLE') { table = node; break; }
      node = node.parentNode;
    }
    return table ? { cell, row, table } : null;
  };

  $('[data-act="tableAddRow"]', m.el).onclick = () => {
    const ctx = getTableContext();
    if (!ctx || !ctx.row) return toast('Place cursor inside a table row to add a row');
    const cols = ctx.row.children.length;
    const newRow = document.createElement('tr');
    for (let i = 0; i < cols; i++) {
      const td = document.createElement('td');
      td.innerHTML = '<br>';
      newRow.appendChild(td);
    }
    ctx.row.after(newRow);
    markDirty();
  };

  $('[data-act="tableDelRow"]', m.el).onclick = () => {
    const ctx = getTableContext();
    if (!ctx || !ctx.row) return toast('Place cursor inside a table row to delete it');
    ctx.row.remove();
    markDirty();
  };

  $('[data-act="tableAddCol"]', m.el).onclick = () => {
    const ctx = getTableContext();
    if (!ctx || !ctx.table) return toast('Place cursor inside a table to add a column');
    const colIdx = ctx.cell ? ctx.cell.cellIndex : ctx.table.rows[0]?.cells.length - 1;
    for (const row of ctx.table.rows) {
      const isHeader = row.parentElement?.tagName === 'THEAD' || row.rowIndex === 0 && row.cells[0]?.tagName === 'TH';
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.innerHTML = isHeader ? 'Header' : '<br>';
      if (row.cells[colIdx]) row.cells[colIdx].after(newCell);
      else row.appendChild(newCell);
    }
    markDirty();
  };

  $('[data-act="tableDelCol"]', m.el).onclick = () => {
    const ctx = getTableContext();
    if (!ctx || !ctx.cell) return toast('Place cursor inside a table column to delete it');
    const colIdx = ctx.cell.cellIndex;
    for (const row of ctx.table.rows) {
      if (row.cells[colIdx]) row.cells[colIdx].remove();
    }
    markDirty();
  };

  // Tab key navigation inside tables
  paper.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const ctx = getTableContext();
      if (ctx && ctx.cell) {
        e.preventDefault();
        const nextCell = ctx.cell.nextElementSibling;
        if (nextCell) {
          nextCell.focus();
        } else {
          const nextRow = ctx.row.nextElementSibling;
          if (nextRow && nextRow.cells[0]) {
            nextRow.cells[0].focus();
          } else {
            // Append a new row at end of table just like MS Word!
            $('[data-act="tableAddRow"]', m.el).click();
          }
        }
      }
    }
  });

  // Insert Tab Actions: Other Elements
  $('[data-act="insertLink"]', m.el).onclick = async () => {
    const url = await prompt({ title: 'Insert Link', label: 'Web Address (URL)', placeholder: 'https://example.com' });
    if (!url) return;
    document.execCommand('createLink', false, url.trim());
    paper.focus();
    markDirty();
  };

  $('[data-act="insertDivider"]', m.el).onclick = () => {
    document.execCommand('insertHorizontalRule', false, null);
    paper.focus();
    markDirty();
  };

  $('[data-act="insertCallout"]', m.el).onclick = () => {
    const html = `<div class="word-callout"><p><b>Note:</b> Type your important note here.</p></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    paper.focus();
    markDirty();
  };

  $('[data-act="insertDate"]', m.el).onclick = () => {
    const now = new Date();
    const dStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.execCommand('insertText', false, dStr);
    paper.focus();
    markDirty();
  };

  m.el.querySelectorAll('[data-sym]').forEach(btn => {
    btn.onclick = () => {
      document.execCommand('insertText', false, btn.dataset.sym);
      paper.focus();
      markDirty();
    };
  });

  $('[data-act="insertChecklist"]', m.el).onclick = () => {
    const html = `<p class="word-task"><input type="checkbox"> <span>To-do item</span></p>`;
    document.execCommand('insertHTML', false, html);
    paper.focus();
    markDirty();
  };

  $('[data-act="insertQuote"]', m.el).onclick = () => {
    document.execCommand('formatBlock', false, '<blockquote>');
    paper.focus();
    markDirty();
  };

  // Layout Tab: Margins & Width
  m.el.querySelectorAll('[data-act="setMargin"]').forEach(btn => {
    btn.onclick = () => {
      m.el.querySelectorAll('[data-act="setMargin"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.val;
      const rulerL = $('.word-ruler-margin-left', m.el);
      const rulerR = $('.word-ruler-margin-right', m.el);
      if (val === 'narrow') {
        paper.style.padding = '32px 36px';
        if (rulerL) rulerL.style.width = '36px';
        if (rulerR) rulerR.style.width = '36px';
      } else if (val === 'wide') {
        paper.style.padding = '64px 96px';
        if (rulerL) rulerL.style.width = '96px';
        if (rulerR) rulerR.style.width = '96px';
      } else {
        paper.style.padding = '54px 64px';
        if (rulerL) rulerL.style.width = '64px';
        if (rulerR) rulerR.style.width = '64px';
      }
    };
  });

  m.el.querySelectorAll('[data-act="setWidth"]').forEach(btn => {
    btn.onclick = () => {
      m.el.querySelectorAll('[data-act="setWidth"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.val;
      const track = $('#wordRulerTrack', m.el);
      if (val === 'wide') {
        paper.style.width = '100%';
        paper.style.maxWidth = '1180px';
        if (track) { track.style.width = '100%'; track.style.maxWidth = '1180px'; }
      } else {
        paper.style.width = '816px';
        paper.style.maxWidth = '100%';
        if (track) { track.style.width = '816px'; track.style.maxWidth = '100%'; }
      }
    };
  });

  // View Tab: Ruler, Shadow, Zoom
  const rulerCheck = $('#toggleRulerCheck', m.el);
  const rulerBar = $('#wordRulerBar', m.el);
  if (rulerCheck && rulerBar) {
    rulerCheck.onchange = () => {
      rulerBar.hidden = !rulerCheck.checked;
    };
  }

  const shadowCheck = $('#toggleShadowCheck', m.el);
  if (shadowCheck) {
    shadowCheck.onchange = () => {
      paper.classList.toggle('no-shadow', !shadowCheck.checked);
    };
  }

  const setZoom = (z) => {
    currentZoom = Math.max(50, Math.min(200, z));
    paper.style.transform = `scale(${currentZoom / 100})`;
    paper.style.transformOrigin = 'top center';
    const vText = $('#viewZoomText', m.el);
    const sText = $('#statusZoomNum', m.el);
    if (vText) vText.textContent = `${currentZoom}%`;
    if (sText) sText.textContent = `${currentZoom}%`;
  };

  m.el.querySelectorAll('[data-act="zoomIn"]').forEach(b => b.onclick = () => setZoom(currentZoom + 10));
  m.el.querySelectorAll('[data-act="zoomOut"]').forEach(b => b.onclick = () => setZoom(currentZoom - 10));
  m.el.querySelectorAll('[data-act="zoomReset"]').forEach(b => b.onclick = () => setZoom(100));

  // Fullscreen Mode Toggle
  const fsBtn = $('[data-act="fullscreen"]', m.el);
  if (fsBtn) {
    fsBtn.onclick = () => {
      isFullscreen = !isFullscreen;
      const modalEl = $('.modal.ms-word-modal', m.el);
      if (modalEl) modalEl.classList.toggle('fullscreen', isFullscreen);
      fsBtn.innerHTML = isFullscreen ? icon('minimize') : icon('maximize');
      fsBtn.title = isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen';
    };
  }

  cleanupListeners = () => {
    document.removeEventListener('selectionchange', onSelectionChange);
    document.removeEventListener('click', hidePopovers);
  };

  // Close modal
  $('[data-cancel]', m.el).onclick = () => {
    cleanupListeners();
    m.close();
  };

  // Wrapped HTML Generator for DOCX Export
  // Download DOCX Directly
  const downloadDocx = async () => {
    let name = nameIn.value.trim() || 'Document.docx';
    if (!name.toLowerCase().endsWith('.docx')) {
      name = name.replace(/\.[^.]+$/, '') + '.docx';
    }
    try {
      const htmlContent = cleanDocHtml(paper.innerHTML);
      const blob = await generateStandardDocx(htmlContent);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('Document downloaded');
    } catch (err) {
      toastError('Failed to export document: ' + err.message);
    }
  };
  $('[data-act="download"]', m.el).onclick = downloadDocx;

  // Load Existing or Initial Content
  if (existing) {
    try {
      const parts = [...folder, existing];
      const res = await fetch(fileUrl(parts));
      if (!res.ok) throw new Error('Could not load file');
      const buf = await res.arrayBuffer();
      const docData = await readDocFile(buf, existing);
      if (docData.html && docData.html.trim().length > 0) {
        paper.innerHTML = cleanDocHtml(docData.html);
      } else if (docData.textRuns && docData.textRuns.length > 0) {
        paper.innerHTML = docData.textRuns.map(p => `<p>${esc(p)}</p>`).join('');
      } else {
        paper.innerHTML = '<p><br></p>';
      }
    } catch (e) {
      toastError('Could not load document: ' + e.message);
      paper.innerHTML = '<p><br></p>';
    }
  } else {
    paper.innerHTML = initialHtml || '<h1>Document Title</h1><p>Start drafting your document here...</p><p><br></p>';
  }

  updateStats();
  setTimeout(() => paper.focus(), 80);

  // Save to DevLocker
  let saving = false;
  const save = async () => {
    if (saving) return;
    let name = nameIn.value.trim();
    if (!name) { nameIn.focus(); return toastError('Give the document a name'); }
    if (name.includes('/')) return toastError('File name cannot contain “/”');
    if (!name.toLowerCase().endsWith('.docx')) {
      name = name.replace(/\.[^.]+$/, '') + '.docx';
      nameIn.value = name;
    }

    saving = true;
    try {
      const htmlContent = cleanDocHtml(paper.innerHTML);
      const docxBlob = await generateStandardDocx(htmlContent);
      const file = new File([docxBlob], name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      if (existing && name !== existing) {
        await api(`/files/${joinPath([...folder, existing])}`, { method: 'PATCH', body: JSON.stringify({ name }) });
      }
      try {
        await uploadOne([...folder, name], file, { overwrite: !!existing && name === existing });
      } catch (e) {
        if (e.status !== 409 || e.message !== 'File already exists') throw e;
        if (!await confirmDialog({ title: 'Replace file?', message: `<b>${esc(name)}</b> already exists. Replace it?`, confirm: 'Replace', danger: false })) return;
        await uploadOne([...folder, name], file, { overwrite: true });
      }
      isDirty = false;
      const st = $('#wordSaveStatus', m.el);
      if (st) {
        st.className = 'word-status-pill saved';
        st.innerHTML = `${icon('check')} <span>Saved</span>`;
      }
      toast('Document saved');
      changed();
    } catch (e) {
      toastError(e.message || 'Failed to save document');
    } finally {
      saving = false;
    }
  };

  $('[data-save]', m.el).onclick = save;
  $('[data-act="quick-save"]', m.el).onclick = save;
  m.el.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      save();
    }
  });
}

function extractDocStrings(u8) {
  const isMimeHeader = (str) => {
    if (!str) return false;
    const s = str.trim();
    if (/^MIME-Version:/i.test(s)) return true;
    if (/^------=mhtDocumentPart/i.test(s)) return true;
    if (/^Content-(?:Type|Transfer-Encoding|Location|ID):/i.test(s)) return true;
    if (/^[A-Za-z0-9+/=]{40,}$/.test(s)) return true;
    return false;
  };

  const utf16Paras = [];
  let cur = '';
  for (let i = 0; i < u8.length - 1; i += 2) {
    const code = u8[i] | (u8[i + 1] << 8);
    if (code === 13 || code === 10) {
      const trimmed = cur.trim();
      if (trimmed.length > 1 && !isMimeHeader(trimmed)) utf16Paras.push(trimmed);
      cur = '';
    } else if ((code >= 32 && code <= 126) || (code >= 160 && code <= 65533)) {
      cur += String.fromCharCode(code);
    } else {
      const trimmed = cur.trim();
      if (trimmed.length > 20 && !isMimeHeader(trimmed)) utf16Paras.push(trimmed);
      cur = '';
    }
  }
  if (cur.trim().length > 1 && !isMimeHeader(cur.trim())) utf16Paras.push(cur.trim());

  if (utf16Paras.join(' ').length < 100) {
    const ansiParas = [];
    cur = '';
    for (let i = 0; i < u8.length; i++) {
      const code = u8[i];
      if (code === 13 || code === 10) {
        const trimmed = cur.trim();
        if (trimmed.length > 1 && !isMimeHeader(trimmed)) ansiParas.push(trimmed);
        cur = '';
      } else if (code >= 32 && code <= 126) {
        cur += String.fromCharCode(code);
      } else {
        const trimmed = cur.trim();
        if (trimmed.length > 20 && !isMimeHeader(trimmed)) ansiParas.push(trimmed);
        cur = '';
      }
    }
    if (cur.trim().length > 1 && !isMimeHeader(cur.trim())) ansiParas.push(cur.trim());
    if (ansiParas.join(' ').length > utf16Paras.join(' ').length) return ansiParas;
  }
  return utf16Paras;
}

/* ---------- Preview ---------- */
async function openPreview(name) {
  const parts = [...state.path, name];
  const url = fileUrl(parts);
  const k = kind(name);
  const file = state.data.files.find(f => f.name === name);
  const textual = isTextual(name);
  const isDoc = k === 'docx';
  const edit = perms.canEdit;

  const m = modal({
    title: name,
    sub: [esc(state.path.join(' / ')), file && fmtSize(file.size), file && fmtDate(file.updated)].filter(Boolean).join(' · '),
    wide: true,
    headTools: `
      ${textual ? `<button class="icon-btn" data-copy title="Copy contents">${icon('copy')}</button>` : ''}
      ${(textual || isDoc) && edit ? `<button class="icon-btn" data-edit title="Edit in browser">${icon('edit')}</button>` : ''}
      <button class="icon-btn" data-link title="Copy download link">${icon('link')}</button>
      ${edit ? `
        <button class="icon-btn" data-copy-item title="Copy file (Ctrl+C)">${icon('copy')}</button>
        <button class="icon-btn" data-move-item title="Move file (Ctrl+X)">${icon('move')}</button>
        <button class="icon-btn danger" data-del title="Move to Trash">${icon('trash')}</button>
      ` : ''}
      <a class="btn primary" href="${url}?download" style="margin:0 4px">${icon('download')} Download</a>`,
    body: `<div class="preview-body"><div class="spin">Loading preview…</div></div>`,
  });
  const body = $('.preview-body', m.el);
  let text = null;

  $('[data-link]', m.el).onclick = () => copy(`${location.origin}${url}?download`, 'Download link copied');
  if (edit) {
    $('[data-copy-item]', m.el)?.addEventListener('click', () => copyItem('file', name));
    $('[data-move-item]', m.el)?.addEventListener('click', () => { m.close(); openMoveDialog('file', name); });
    $('[data-del]', m.el).onclick = async () => { if (await moveToTrash(`/files/${joinPath(parts)}`, name)) m.close(); };
  }

  try {
    if (k === 'img') body.innerHTML = `<div class="preview-center"><img src="${url}" alt="${esc(name)}"></div>`;
    else if (k === 'pdf') body.innerHTML = `<iframe src="${url}" title="${esc(name)}"></iframe>`;
    else if (k === 'video') body.innerHTML = `<div class="preview-center"><video src="${url}" controls></video></div>`;
    else if (k === 'audio') body.innerHTML = `<div class="preview-center"><audio src="${url}" controls></audio></div>`;
    else if (k === 'docx') {
      if (file && file.size > 25 * 1024 * 1024) throw new Error('too-big');
      const res = await fetch(url);
      if (!res.ok) throw new Error('Could not load file');
      const buffer = await res.arrayBuffer();
      const docData = await readDocFile(buffer, name);

      if (docData.type === 'html') {
        body.innerHTML = `
          <div class="docx-preview-wrapper">
            <div class="docx-wrapper">
              <section class="docx word-paper" style="padding:54pt 54pt;max-width:816px;width:100%;min-height:1056px;box-sizing:border-box;">
                ${DOMPurify.sanitize(cleanDocHtml(docData.html))}
              </section>
            </div>
          </div>`;
      } else if (docData.type === 'openxml') {
        let rendered = false;
        if (window.docx && typeof window.docx.renderAsync === 'function') {
          try {
            const wrap = document.createElement('div');
            wrap.className = 'docx-preview-wrapper';
            body.replaceChildren(wrap);
            await window.docx.renderAsync(buffer, wrap, null, {
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              breakPages: true,
              useBase64URL: true,
            });
            rendered = true;
          } catch (renderErr) {
            console.warn('docx.renderAsync failed, falling back to clean HTML:', renderErr);
          }
        }
        if (!rendered) {
          if (docData.html && docData.html.trim().length > 0) {
            body.innerHTML = `
              <div class="docx-preview-wrapper">
                <div class="docx-wrapper">
                  <section class="docx word-paper" style="padding:54pt 54pt;max-width:816px;width:100%;min-height:1056px;box-sizing:border-box;">
                    ${DOMPurify.sanitize(cleanDocHtml(docData.html))}
                  </section>
                </div>
              </div>`;
          } else {
            throw new Error('no-preview');
          }
        }
      } else if (docData.type === 'legacy') {
        if (docData.textRuns && docData.textRuns.length > 0) {
          body.innerHTML = `
            <div class="legacy-doc-preview">
              <div class="legacy-doc-banner">
                <span>${ext(name) === 'doc' ? 'Legacy Word document (.doc)' : 'Document text preview'}</span>
                <a class="btn" href="${url}?download">${icon('download')} Download original</a>
              </div>
              <div class="legacy-doc-content">${docData.textRuns.map(p => `<p>${esc(p)}</p>`).join('')}</div>
            </div>`;
        } else {
          throw new Error('no-preview');
        }
      }
    } else if (textual) {
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
  }
  if (edit) {
    const editBtn = $('[data-edit]', m.el);
    if (editBtn) {
      editBtn.onclick = () => {
        m.close();
        if (isDoc) openDocEditor(name);
        else if (text != null) openEditor(name, text);
      };
    }
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
