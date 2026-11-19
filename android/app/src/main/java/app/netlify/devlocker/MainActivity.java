package app.netlify.devlocker;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * DevLocker as a self-contained app: the live site in Android's WebView.
 *
 * - The site's service worker runs here too, so it opens offline with the
 *   last data you saw.
 * - File uploads use the system file picker.
 * - Link downloads (files, folder ZIPs) go through DownloadManager.
 * - Files made in the page (PDF / .docx exports) arrive through the
 *   "DevLockerApp" bridge, which app.js uses when it exists.
 */
public class MainActivity extends Activity {
    private static final String HOST = BuildConfig.SITE_HOST;
    private static final String HOME = "https://" + HOST + "/";
    private static final String OFFLINE_PAGE = "file:///android_asset/offline.html";
    private static final int REQ_FILES = 1;
    private static final int REQ_STORAGE = 2;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " DevLockerApp/" + BuildConfig.VERSION_NAME);

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(web, true);

        web.addJavascriptInterface(new Bridge(), "DevLockerApp");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome());
        web.setDownloadListener(this::downloadUrl);

        if (saved != null) web.restoreState(saved);
        else web.loadUrl(HOME);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    // ---------- Navigation ----------

    private class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri uri = req.getUrl();
            String scheme = uri.getScheme();
            if (HOST.equals(uri.getHost()) || "file".equals(scheme)) return false;
            // Redirects (e.g. a download link → storage) and frames stay in the app.
            if (req.isRedirect() || !req.isForMainFrame()) return false;
            // Any other site, mailto:, tel: … open in the right app.
            try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
            catch (ActivityNotFoundException ignored) {}
            return true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
            // Only when the page itself can't load and there's no saved copy
            // (i.e. the very first launch was offline).
            if (req.isForMainFrame()) view.loadUrl(OFFLINE_PAGE);
        }
    }

    // ---------- File uploads ----------

    private class Chrome extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = callback;
            Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
            pick.addCategory(Intent.CATEGORY_OPENABLE);
            pick.setType("*/*");
            if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            try {
                startActivityForResult(Intent.createChooser(pick, "Choose files"), REQ_FILES);
            } catch (ActivityNotFoundException e) {
                fileCallback = null;
                toast("No file picker available");
                return false;
            }
            return true;
        }
    }

    @SuppressWarnings("deprecation")
    @Override
    protected void onActivityResult(int req, int result, Intent data) {
        super.onActivityResult(req, result, data);
        if (req != REQ_FILES || fileCallback == null) return;
        Uri[] uris = null;
        if (result == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int n = data.getClipData().getItemCount();
                uris = new Uri[n];
                for (int i = 0; i < n; i++) uris[i] = data.getClipData().getItemAt(i).getUri();
            } else if (data.getData() != null) {
                uris = new Uri[]{ data.getData() };
            }
        }
        fileCallback.onReceiveValue(uris);
        fileCallback = null;
    }

    // ---------- Downloads ----------

    private boolean needsStoragePermission() {
        if (Build.VERSION.SDK_INT >= 29) return false;
        if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) return false;
        requestPermissions(new String[]{ Manifest.permission.WRITE_EXTERNAL_STORAGE }, REQ_STORAGE);
        toast("Allow storage access, then tap download again");
        return true;
    }

    /** A normal link download: a file, or a folder as .zip. */
    private void downloadUrl(String url, String userAgent, String disposition, String mime, long length) {
        if (url.startsWith("blob:") || url.startsWith("data:")) return; // handled by the bridge
        if (needsStoragePermission()) return;
        String name = fileName(url, disposition);
        try {
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
            String cookie = CookieManager.getInstance().getCookie(url);
            if (cookie != null) r.addRequestHeader("Cookie", cookie);
            r.addRequestHeader("User-Agent", userAgent);
            if (mime != null && !mime.isEmpty()) r.setMimeType(mime);
            r.setTitle(name);
            r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
            ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(r);
            toast("Downloading " + name);
        } catch (Exception e) {
            toast("Download failed: " + e.getMessage());
        }
    }

    private static String fileName(String url, String disposition) {
        if (disposition != null) {
            Matcher m = Pattern.compile("filename\\*=(?:UTF-8|utf-8)''([^;]+)").matcher(disposition);
            try { if (m.find()) return clean(URLDecoder.decode(m.group(1).trim(), "UTF-8")); } catch (Exception ignored) {}
            m = Pattern.compile("filename=\"?([^\";]+)\"?").matcher(disposition);
            if (m.find()) return clean(m.group(1).trim());
        }
        Uri u = Uri.parse(url);
        String q = u.getQueryParameter("download");
        if (q != null && !q.isEmpty()) return clean(q);
        String last = u.getLastPathSegment();
        if (last == null || last.isEmpty()) return "download";
        return clean(u.getPath() != null && u.getPath().startsWith("/api/zip/") ? last + ".zip" : last);
    }

    private static String clean(String name) {
        String n = name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        return n.isEmpty() ? "download" : n;
    }

    /** Called from app.js for files built in the page (PDF, .docx, filled copies). */
    private class Bridge {
        @JavascriptInterface
        public void saveFile(String name, String mime, String base64) {
            runOnUiThread(() -> {
                if (needsStoragePermission()) return;
                try {
                    byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                    String file = clean(name);
                    String type = mime == null || mime.isEmpty() ? "application/octet-stream" : mime;
                    if (Build.VERSION.SDK_INT >= 29) {
                        ContentValues v = new ContentValues();
                        v.put(MediaStore.Downloads.DISPLAY_NAME, file);
                        v.put(MediaStore.Downloads.MIME_TYPE, type);
                        v.put(MediaStore.Downloads.IS_PENDING, 1);
                        ContentResolver cr = getContentResolver();
                        Uri uri = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                        if (uri == null) throw new Exception("could not create the file");
                        try (OutputStream out = cr.openOutputStream(uri)) { out.write(bytes); }
                        v.clear();
                        v.put(MediaStore.Downloads.IS_PENDING, 0);
                        cr.update(uri, v, null, null);
                    } else {
                        File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                        //noinspection ResultOfMethodCallIgnored
                        dir.mkdirs();
                        File out = uniqueFile(dir, file);
                        try (FileOutputStream fo = new FileOutputStream(out)) { fo.write(bytes); }
                    }
                    toast("Saved to Downloads: " + file);
                } catch (Exception e) {
                    toast("Could not save: " + e.getMessage());
                }
            });
        }

        @JavascriptInterface
        public String version() { return BuildConfig.VERSION_NAME; }
    }

    private static File uniqueFile(File dir, String name) {
        File f = new File(dir, name);
        int dot = name.lastIndexOf('.');
        String base = dot > 0 ? name.substring(0, dot) : name, ext = dot > 0 ? name.substring(dot) : "";
        for (int i = 1; f.exists(); i++) f = new File(dir, base + " (" + i + ")" + ext);
        return f;
    }

    private void toast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }
}
