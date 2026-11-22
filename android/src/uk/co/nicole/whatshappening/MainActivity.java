package uk.co.nicole.whatshappening;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.*;
import android.provider.Settings;
import android.view.*;
import android.webkit.*;
import android.widget.FrameLayout;
import android.widget.Toast;
import org.json.*;
import java.io.*;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.*;

public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final int NOTIFICATION_REQUEST = 41, EXPORT_REQUEST = 42;
    private WebView web;
    private UpdateChecker updater;
    private boolean ready;
    private String pendingEvent, calendarExport;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        ReminderScheduler.createChannel(this);
        updater = new UpdateChecker(this, this::updateAppStatus);
        pendingEvent = getIntent().getStringExtra("event");
        FrameLayout root = new FrameLayout(this); root.setBackgroundColor(0xFFF5F2FF);
        web = new WebView(this); root.addView(web, new FrameLayout.LayoutParams(-1, -1)); setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            getWindow().getInsetsController().setSystemBarsAppearance(WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom); return insets;
            });
        } else web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        web.setBackgroundColor(0xFFF5F2FF);
        WebSettings config = web.getSettings();
        config.setJavaScriptEnabled(true); config.setDomStorageEnabled(true);
        config.setAllowFileAccess(false); config.setAllowContentAccess(false);
        config.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        config.setMediaPlaybackRequiresUserGesture(true);
        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !"appassets.androidplatform.net".equals(uri.getHost()) || !uri.getPath().startsWith("/assets/")) return blocked();
                String path = uri.getPath().substring(8);
                if (path.contains("..") || path.startsWith("/") || path.contains("\\")) return blocked();
                try {
                    String type = path.endsWith(".js") ? "text/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".woff2") ? "font/woff2" : URLConnection.guessContentTypeFromName(path);
                    if (type == null) type = "application/octet-stream";
                    return new WebResourceResponse(type, "UTF-8", getAssets().open("web/" + path));
                } catch (IOException exception) { return blocked(); }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request.getUrl().toString().startsWith(ORIGIN + "/assets/")) return false;
                openExternal(request.getUrl().toString()); return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                ready = true; updateStatus(); updateAppStatus(); dispatchEvent();
            }
        });
        web.loadUrl(ORIGIN + "/assets/index.html");
    }
    private WebResourceResponse blocked() {
        return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
    }
    @Override protected void onResume() { super.onResume(); ReminderScheduler.reschedule(this); updateStatus(); if (updater != null) updater.check(false); }
    @Override protected void onDestroy() { if (updater != null) updater.close(); if (web != null) web.destroy(); super.onDestroy(); }
    private void updateAppStatus() { if (web != null && ready) web.evaluateJavascript("window.onNativeUpdate && window.onNativeUpdate()", null); }
    @Override protected void onNewIntent(Intent intent) { super.onNewIntent(intent); setIntent(intent); pendingEvent = intent.getStringExtra("event"); dispatchEvent(); }
    private void dispatchEvent() {
        if (ready && pendingEvent != null) { String id = pendingEvent; pendingEvent = null; web.evaluateJavascript("window.openNativeEvent && window.openNativeEvent(" + JSONObject.quote(id) + ")", null); }
    }
    private void updateStatus() { if (web != null && ready) web.evaluateJavascript("window.onNativeStatus && window.onNativeStatus()", null); }
    private void openExternal(String url) {
        Uri uri = Uri.parse(url);
        if (!"https".equals(uri.getScheme()) && !"http".equals(uri.getScheme())) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
        catch (ActivityNotFoundException ignored) { Toast.makeText(this, "No browser available", Toast.LENGTH_SHORT).show(); }
    }
    @Override public void onBackPressed() {
        web.evaluateJavascript("Boolean(window.handleNativeBack && window.handleNativeBack())", value -> { if (!"true".equals(value)) MainActivity.super.onBackPressed(); });
    }
    @Override public void onRequestPermissionsResult(int request, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(request, permissions, results);
        if (request == NOTIFICATION_REQUEST) { ReminderScheduler.reschedule(this); updateStatus(); }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == EXPORT_REQUEST && result == RESULT_OK && data != null && data.getData() != null && calendarExport != null) {
            try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                output.write(calendarExport.getBytes(StandardCharsets.UTF_8));
                Toast.makeText(this, "File saved", Toast.LENGTH_SHORT).show();
            } catch (IOException exception) { Toast.makeText(this, "Could not save file", Toast.LENGTH_LONG).show(); }
        }
        calendarExport = null;
    }
    public final class Bridge {
        @JavascriptInterface public String getUpdateStatus() { return updater.state(); }
        @JavascriptInterface public void checkForUpdates() { runOnUiThread(() -> updater.check(true)); }
        @JavascriptInterface public void downloadUpdate() { runOnUiThread(() -> updater.download()); }
        @JavascriptInterface public String getState() {
            JSONObject state = new JSONObject();
            try { state.put("initialized", ReminderScheduler.prefs(MainActivity.this).getBoolean("initialized", false)); state.put("settings", ReminderScheduler.settings(MainActivity.this)); state.put("saved", new JSONArray(ReminderScheduler.saved(MainActivity.this))); }
            catch (JSONException ignored) {}
            return state.toString();
        }
        @JavascriptInterface public void syncState(String raw) {
            if (raw == null || raw.length() > 100000) return;
            try {
                JSONObject input = new JSONObject(raw), values = input.getJSONObject("settings"), clean = new JSONObject();
                clean.put("daily", values.optBoolean("daily", true)); clean.put("extra", values.optBoolean("extra", true));
                String daily = values.optString("dailyTime", "09:00"), extra = values.optString("extraTime", "08:00");
                if (!AlarmPlan.validTime(daily) || !AlarmPlan.validTime(extra)) return;
                clean.put("dailyTime", daily); clean.put("extraTime", extra);
                JSONArray ids = input.getJSONArray("saved"), selected = new JSONArray(); Set<String> unique = new HashSet<>();
                for (int i = 0; i < ids.length(); i++) { String id = ids.getString(i); if (Catalogue.contains(MainActivity.this, id) && unique.add(id)) selected.put(id); }
                ReminderScheduler.prefs(MainActivity.this).edit().putString("settings", clean.toString()).putString("saved", selected.toString()).putBoolean("initialized", true).apply();
                ReminderScheduler.reschedule(MainActivity.this);
            } catch (JSONException ignored) {}
        }
        @JavascriptInterface public String getStatus() {
            JSONObject state = new JSONObject();
            try { state.put("notificationsAllowed", ReminderScheduler.allowed(MainActivity.this)); state.put("exactAlarmsAllowed", ReminderScheduler.precise(MainActivity.this)); }
            catch (JSONException ignored) {}
            return state.toString();
        }
        @JavascriptInterface public void requestNotifications() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    boolean requested = ReminderScheduler.prefs(MainActivity.this).getBoolean("permissionRequested", false);
                    if (!requested || shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
                        ReminderScheduler.prefs(MainActivity.this).edit().putBoolean("permissionRequested", true).apply();
                        requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_REQUEST); return;
                    }
                }
                startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName()));
            });
        }
        @JavascriptInterface public void requestPreciseAlarms() {
            if (Build.VERSION.SDK_INT >= 31) runOnUiThread(() -> startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + getPackageName()))));
        }
        @JavascriptInterface public void testNotification() { ReminderScheduler.test(MainActivity.this); }
        @JavascriptInterface public void openExternal(String url) { runOnUiThread(() -> MainActivity.this.openExternal(url)); }
        @JavascriptInterface public void exportDesignComments(String content, String filename) {
            if (content == null || content.length() > 4000000) return;
            try {
                if (!"whats-happening.design-review/v1".equals(new JSONObject(content).optString("schema"))) return;
            } catch (JSONException ignored) { return; }
            final String name = filename != null && filename.matches("whats-happening-design-notes-[0-9-]+\\.json") ? filename : "whats-happening-design-notes.json";
            runOnUiThread(() -> { calendarExport = content; startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("application/json").addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE, name), EXPORT_REQUEST); });
        }
        @JavascriptInterface public void exportCalendar(String content) {
            if (content == null || content.length() > 500000 || !content.startsWith("BEGIN:VCALENDAR")) return;
            runOnUiThread(() -> { calendarExport = content; startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("text/calendar").addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE, "my-days-november-december-2026.ics"), EXPORT_REQUEST); });
        }
    }
}
