package uk.co.nicole.whatshappening;

import android.app.Activity;
import android.content.*;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.widget.Toast;
import org.json.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.*;

/** Checks a public release manifest; installation stays with Android's browser/installer. */
public final class UpdateChecker {
    private final Activity activity;
    private final Runnable changed;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final SharedPreferences prefs;
    private final long installedCode;
    private final String installedName;
    private volatile String snapshot = "{}";
    private boolean checking;
    private long lastAttempt, lastChecked;
    private JSONObject latest;
    private String status = "idle";

    public UpdateChecker(Activity activity, Runnable changed) {
        this.activity = activity; this.changed = changed;
        prefs = activity.getSharedPreferences("app-updates", Context.MODE_PRIVATE);
        PackageInfo info;
        try { info = activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0); }
        catch (Exception exception) { throw new IllegalStateException("Installed version unavailable", exception); }
        installedCode = Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode;
        installedName = info.versionName;
        lastAttempt = prefs.getLong("attempt", 0); lastChecked = prefs.getLong("checked", 0);
        try { JSONObject cached = new JSONObject(prefs.getString("release", "{}")); if (valid(cached)) latest = cached; } catch (JSONException ignored) {}
        refresh();
    }
    private boolean valid(JSONObject value) {
        try { return UpdatePolicy.valid(value.getString("packageName"), value.getLong("versionCode"), value.getString("versionName"), value.getInt("minSdk"), value.getString("apkUrl")); }
        catch (JSONException ignored) { return false; }
    }
    private boolean available() {
        return latest != null && UpdatePolicy.newer(installedCode, latest.optLong("versionCode"), Build.VERSION.SDK_INT, latest.optInt("minSdk"));
    }
    private void refresh() {
        JSONObject value = new JSONObject();
        try {
            value.put("installedVersion", installedName); value.put("installedCode", installedCode);
            value.put("status", status); value.put("checking", checking); value.put("available", available());
            value.put("lastChecked", lastChecked);
            if (latest != null) { value.put("latestVersion", latest.optString("versionName")); value.put("releaseNotes", latest.optString("releaseNotes", "").substring(0, Math.min(1200, latest.optString("releaseNotes", "").length()))); }
        } catch (JSONException ignored) {}
        snapshot = value.toString(); changed.run();
    }
    public String state() { return snapshot; }
    /** Call from the UI thread. Automatic errors stay quiet; manual errors appear in settings. */
    public void check(boolean manual) {
        long now = System.currentTimeMillis();
        if (checking || !UpdatePolicy.shouldCheck(manual, now, lastAttempt) || activity.isFinishing() || activity.isDestroyed()) return;
        lastAttempt = now; prefs.edit().putLong("attempt", now).apply();
        checking = true; status = "checking"; refresh();
        if (manual) Toast.makeText(activity, "Checking for updates…", Toast.LENGTH_SHORT).show();
        worker.execute(() -> {
            JSONObject release = null; HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection)new URL(UpdatePolicy.FEED + "?check=" + now).openConnection();
                connection.setInstanceFollowRedirects(false); connection.setConnectTimeout(8000); connection.setReadTimeout(8000);
                connection.setUseCaches(false); connection.setRequestProperty("Cache-Control", "no-cache"); connection.setRequestProperty("Accept", "application/json");
                if (connection.getResponseCode() != 200) throw new IOException("Update check failed");
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                try (InputStream input = connection.getInputStream()) {
                    byte[] buffer = new byte[4096]; int length;
                    while ((length = input.read(buffer)) != -1) { if (bytes.size() + length > 16384) throw new IOException("Manifest too large"); bytes.write(buffer, 0, length); }
                }
                JSONObject candidate = new JSONObject(new String(bytes.toByteArray(), StandardCharsets.UTF_8));
                if (!valid(candidate)) throw new IOException("Invalid release"); release = candidate;
            } catch (Exception ignored) {} finally { if (connection != null) connection.disconnect(); }
            final JSONObject result = release;
            activity.runOnUiThread(() -> {
                if (activity.isFinishing() || activity.isDestroyed()) return;
                checking = false;
                if (result == null) status = "error";
                else {
                    latest = result; lastChecked = System.currentTimeMillis();
                    status = available() ? "available" : latest.optLong("versionCode") > installedCode ? "unsupported" : "current";
                    prefs.edit().putLong("checked", lastChecked).putString("release", result.toString()).apply();
                }
                refresh();
            });
        });
    }
    public void download() {
        if (!available()) return;
        try { activity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(latest.optString("apkUrl"))).addCategory(Intent.CATEGORY_BROWSABLE)); }
        catch (ActivityNotFoundException ignored) { Toast.makeText(activity, "No browser available to download the update", Toast.LENGTH_LONG).show(); }
    }
    public void close() { worker.shutdownNow(); }
}
