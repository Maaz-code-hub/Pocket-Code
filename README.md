# Code Saver

A personal cloud for code snippets and docs. No sign-in, no npm dependencies.

- Folders on the home screen, with sub-folders as deep as you like; create, rename, delete
- Inside a folder: write code/notes in the browser, upload files, or upload / drag & drop a
  whole folder (its structure is kept; `.git`, `node_modules` etc. are skipped)
- Preview code (syntax highlighted), Markdown, images, PDFs, video, audio
- Download any file, or a whole folder as a ZIP
- Code editor with syntax colours, line numbers, find (Ctrl+F), comment toggle (Ctrl+/)
- Trash: deleted items can be restored for 30 days (with an Undo button right after deleting)
- Storage meter at the top (e.g. "312 MB of 1 GB")
- Optional view-only mode: everyone can browse/download, only people with the edit key can change things

Files are stored in **Supabase Storage** when configured, otherwise on local disk.
Everyone who opens the site sees the same files.

## 1. Set up Supabase (free, 1 GB)

1. Create a project at https://supabase.com
2. Go to **Project Settings → API** and copy:
   - the **Project URL**
   - the **secret key** (`sb_secret_...`), or the legacy `service_role` key
3. Copy `.env.example` to `.env` and fill them in:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_xxxxxxxx
```

A private bucket named `code-saver` is created automatically on first start.
The secret key stays on your server only; the browser never sees it.

## 2. Run it

```bash
npm start                        # needs Node 20.12+
# or
docker compose up -d --build
```

Open `http://<your-server>:3000`. On start-up the log says where files are stored:

```
Storing files in Supabase bucket "code-saver"
```

## Settings (`.env`)

| Variable               | Default      | What it does                                         |
|------------------------|--------------|------------------------------------------------------|
| `SUPABASE_URL`         | (empty)      | Supabase project URL. Empty = store on local disk    |
| `SUPABASE_SERVICE_KEY` | (empty)      | Supabase secret / service_role key                   |
| `SUPABASE_BUCKET`      | `code-saver` | Bucket name (created automatically, private)         |
| `PORT`                 | `3000`       | Port to listen on                                    |
| `MAX_UPLOAD_MB`        | `50`         | Max upload size (Supabase free plan limit is 50 MB)  |
| `STORAGE_LIMIT_MB`     | `1024`       | Total shown in the storage meter; uploads stop when full |
| `EDIT_KEY`             | (empty)      | Optional. View-only mode: changes need this key (asked once per browser) |
| `ACCESS_KEY`           | (empty)      | Optional. If set, the site asks for this key just to open it |
| `DATA_DIR`             | `./data`     | Local folder used only when Supabase isn't set       |

> With no `EDIT_KEY`, anyone who knows the URL can change and delete your files
> (deleted items still go to the Trash for 30 days).
