# DevLocker 🔐

A lightweight, personal cloud locker for your code snippets, documents, and files. Zero frontend framework overhead, a clean Microsoft Word-style doc editor, full code syntax highlighting, Redis-powered caching, automatic Supabase keep-alive, and ready for 1-click Netlify or self-hosted deployment.

---

## ✨ Features

- 📁 **Organized Folders**: Nested subfolders as deep as you like; create, rename, download, and delete.
- 📝 **MS Word-Style Doc Editor**: Professional document workspace with ribbon toolbar (Home, Insert, Layout, Review, View), rich typography (Aptos, Carlito, Calibri, Georgia, JetBrains Mono), page zoom, print layout, and export to `.docx`.
- 💻 **Syntax-Highlighted Code Editor**: Built-in CodeMirror editor with syntax coloring, line numbers, search (`Ctrl+F`), and comment toggles (`Ctrl+/`).
- ⚡ **Redis Caching Layer**: Integrated with Upstash or Redis Cloud to cache folder structures and files with a 12-hour TTL — reducing database queries to once every 12 hours. Falls back to in-memory caching seamlessly.
- 💓 **Supabase Keep-Alive Heartbeat**: Built-in automated heartbeat pings (`KEEP_ALIVE_HOURS=6`) and GitHub Actions workflow to prevent Supabase's free-tier 7-day auto-pause.
- 🚀 **Netlify Serverless Ready**: Deploy to Netlify in minutes with edge CDN static asset delivery and serverless API functions.
- 👁️ **Instant Previews**: Preview code, Markdown, images, PDFs, audio, and video directly in the browser.
- 📦 **Bulk Upload & ZIP Download**: Drag & drop entire folder hierarchies (automatically skips `.git` and `node_modules`), or download any folder as a `.zip`.
- 🗑️ **30-Day Trash**: Accidental deletions go to Trash with instant undo and 30-day retention before permanent purge.
- 🔒 **Access & Edit Security**: Optional view-only mode (`EDIT_KEY`) and whole-site lock (`ACCESS_KEY`).

---

## 🛠️ Tech Stack

- **Backend**: Node.js HTTP server / Netlify Serverless Functions (`serverless-http`)
- **Storage**: Supabase Storage (S3-compatible) or local disk
- **Cache**: Upstash Redis (`ioredis`) with automatic in-memory fallback
- **Frontend**: Vanilla ES6+, CSS variables, CodeMirror, Quill-based Word workspace

---

## 🚀 Deployment

### Option A: Deploy to Netlify (Recommended)

1. **Push** this repository to your GitHub.
2. In [Netlify](https://app.netlify.com), click **Add new site > Import an existing project** and select your repo.
3. **Build settings** (Netlify auto-detects [`netlify.toml`](./netlify.toml)):
   - **Publish directory**: `public`
   - **Functions directory**: `netlify/functions`
   - **Build command**: *(leave blank)*
4. **Environment Variables**:
   Under **Site configuration > Environment variables**, import your `.env` variables (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `REDIS_URL`, `EDIT_KEY`, etc.).
5. Click **Deploy**.

---

### Option B: Run Locally or on a VPS

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase / Redis details

# 3. Start server (Node.js 20.12+)
npm start
```

Or run with **Docker**:

```bash
docker compose up -d --build
```

Access the app at `http://localhost:3000`.

---

## 🗄️ Supabase Setup (Free 1 GB Storage)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → API** and copy:
   - **Project URL** (`https://<project-id>.supabase.co`)
   - **Secret key** (`sb_secret_...` or legacy `service_role` key)
3. Add them to your `.env` or Netlify environment variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_xxxxxxxx
SUPABASE_BUCKET=code-saver
```

*Note: The private storage bucket is created automatically on initial launch.*

---

## ⚡ Redis Cache Setup (Upstash)

To eliminate repetitive database calls and accelerate page loads:
1. Create a free database at [Upstash](https://upstash.com).
2. Copy your Redis connection URL (starting with `rediss://...`).
3. Add it to your `.env` or Netlify environment variables:

```env
REDIS_URL=rediss://default:password@your-endpoint.upstash.io:6379
CACHE_TTL_HOURS=12
CACHE_FILE_MAX_MB=5
```

---

## ⚙️ Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `SUPABASE_URL` | *(empty)* | Supabase project URL. If empty, local disk `./data` is used. |
| `SUPABASE_SERVICE_KEY` | *(empty)* | Supabase secret / service_role key (server-side only). |
| `SUPABASE_BUCKET` | `code-saver` | Supabase storage bucket name. |
| `REDIS_URL` | *(empty)* | Redis connection URL (`rediss://...`). Falls back to in-memory cache if omitted. |
| `CACHE_TTL_HOURS` | `12` | Cache TTL in hours. Database queries occur once every N hours. |
| `CACHE_FILE_MAX_MB` | `5` | Maximum file size in MB cached in Redis for instantaneous previews. |
| `KEEP_ALIVE_HOURS` | `6` | Hours between automatic Supabase keep-alive pings (prevents 7-day pause). |
| `MAX_UPLOAD_MB` | `50` | Maximum upload size per file (Supabase free plan limit is 50 MB). |
| `STORAGE_LIMIT_MB` | `1024` | Storage limit meter shown in UI (MB). Uploads stop when full. |
| `EDIT_KEY` | *(empty)* | Optional. When set, guests can view and download, but edits/uploads require this key. |
| `ACCESS_KEY` | *(empty)* | Optional. Password-protects the entire site. |
| `PORT` | `3000` | Port for standalone local server. |

---

## 🔒 Security & Privacy

- **Server-Only Credentials**: Your `SUPABASE_SERVICE_KEY` and `REDIS_URL` are strictly accessible on the backend/serverless functions and never exposed to the client browser.
- **Sandboxed File Delivery**: Uploaded HTML and media are served with strict `Content-Security-Policy` headers to prevent script execution on your origin.
- **Timing-Safe Auth**: Key verification employs `crypto.timingSafeEqual` with rate limiting to prevent brute-force attacks.
