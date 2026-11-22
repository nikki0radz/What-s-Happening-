package uk.co.nicole.whatshappening;

import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.Build;
import org.json.*;
import java.time.*;
import java.util.*;

final class ReminderScheduler {
    static final String CHANNEL = "discoveries";
    static final int DAILY = 101, SAVED = 102, TEST = 103;
    static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences("happening", Context.MODE_PRIVATE);
    }
    static void createChannel(Context context) {
        NotificationChannel channel = new NotificationChannel(CHANNEL, "Daily discoveries & saved days", NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("A daily round-up and extra reminders for the events you save.");
        context.getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }
    static boolean allowed(Context context) {
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        NotificationChannel channel = manager.getNotificationChannel(CHANNEL);
        return manager.areNotificationsEnabled() && (channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE)
            && (Build.VERSION.SDK_INT < 33 || context.checkSelfPermission("android.permission.POST_NOTIFICATIONS") == PackageManager.PERMISSION_GRANTED);
    }
    static boolean precise(Context context) {
        return Build.VERSION.SDK_INT < 31 || context.getSystemService(AlarmManager.class).canScheduleExactAlarms();
    }
    static JSONObject settings(Context context) {
        try { return new JSONObject(prefs(context).getString("settings", "{}")); }
        catch (JSONException exception) { return new JSONObject(); }
    }
    static Set<String> saved(Context context) {
        Set<String> result = new LinkedHashSet<>();
        try {
            JSONArray array = new JSONArray(prefs(context).getString("saved", "[]"));
            for (int i = 0; i < array.length(); i++) if (Catalogue.contains(context, array.getString(i))) result.add(array.getString(i));
        } catch (JSONException ignored) {}
        return result;
    }
    static synchronized void reschedule(Context context) {
        createChannel(context);
        schedule(context, DAILY);
        schedule(context, SAVED);
    }
    private static PendingIntent alarm(Context context, int kind, String date) {
        Intent intent = new Intent(context, ReminderReceiver.class).setAction("uk.co.nicole.whatshappening.REMIND." + kind);
        intent.putExtra("kind", kind); intent.putExtra("date", date);
        return PendingIntent.getBroadcast(context, kind, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    static synchronized void schedule(Context context, int kind) {
        AlarmManager manager = context.getSystemService(AlarmManager.class);
        manager.cancel(alarm(context, kind, ""));
        JSONObject config = settings(context);
        boolean enabled = config.optBoolean(kind == DAILY ? "daily" : "extra", true);
        if (!enabled || !allowed(context)) return;
        String time = config.optString(kind == DAILY ? "dailyTime" : "extraTime", kind == DAILY ? "09:00" : "08:00");
        if (!AlarmPlan.validTime(time)) return;
        Set<String> saved = saved(context), dates = new TreeSet<>(), completed = new HashSet<>();
        for (Catalogue.Event event : Catalogue.all(context)) {
            if (kind == SAVED && !saved.contains(event.id)) continue;
            dates.add(event.date);
        }
        SharedPreferences preferences = prefs(context);
        for (String date : dates) {
            if (kind == DAILY && preferences.getBoolean("daily:" + date, false)) completed.add(date);
            if (kind == SAVED) {
                boolean allSent = true;
                for (Catalogue.Event event : Catalogue.on(context, date)) {
                    if (saved.contains(event.id) && !preferences.getBoolean("saved:" + event.id, false)) allSent = false;
                }
                if (allSent) completed.add(date);
            }
        }
        Instant now = Instant.now();
        Instant next = AlarmPlan.next(new ArrayList<>(dates), time, ZoneId.systemDefault(), now, completed);
        if (next == null) return;
        String date = next.atZone(ZoneId.systemDefault()).toLocalDate().toString();
        setAlarm(context, manager, next.toEpochMilli(), alarm(context, kind, date));
    }
    private static void setAlarm(Context context, AlarmManager manager, long when, PendingIntent pending) {
        if (precise(context)) {
            try { manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pending); return; }
            catch (SecurityException ignored) { /* Permission may have changed since the check. */ }
        }
        manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pending);
    }
    static void test(Context context) {
        if (!allowed(context)) return;
        setAlarm(context, context.getSystemService(AlarmManager.class), System.currentTimeMillis() + 10000,
            alarm(context, TEST, LocalDate.now().toString()));
    }
    static synchronized void deliver(Context context, int kind, String date) {
        try {
            if (!allowed(context)) return;
            if (kind != TEST && !LocalDate.now().toString().equals(date)) return;
            JSONObject config = settings(context);
            List<Catalogue.Event> events = Catalogue.on(context, date);
            if (kind == TEST) {
                show(context, 9000, "A little discovery, delivered.", "Your reminders work with the app closed too.", events, date, true);
            } else if (kind == DAILY && config.optBoolean("daily", true) && !events.isEmpty()) {
                if (prefs(context).getBoolean("daily:" + date, false)) return;
                show(context, 1000, events.size() + " things happening today", joinTitles(events), events, date, false);
                prefs(context).edit().putBoolean("daily:" + date, true).apply();
            } else if (kind == SAVED && config.optBoolean("extra", true)) {
                Set<String> selected = saved(context);
                for (Catalogue.Event event : events) {
                    if (!selected.contains(event.id) || prefs(context).getBoolean("saved:" + event.id, false)) continue;
                    show(context, event.id.hashCode(), "One of your days · " + event.title,
                        "Today’s the day. Tap for the little details.", Collections.singletonList(event), event.id, false);
                    prefs(context).edit().putBoolean("saved:" + event.id, true).apply();
                }
            }
        } finally {
            // Reschedule only the fired type. Rescheduling both can cancel a simultaneous saved-day alarm.
            if (kind == DAILY || kind == SAVED) schedule(context, kind);
        }
    }
    private static String joinTitles(List<Catalogue.Event> events) {
        StringBuilder text = new StringBuilder();
        for (Catalogue.Event event : events) { if (text.length() > 0) text.append(" · "); text.append(event.title); }
        return text.toString();
    }
    private static void show(Context context, int id, String title, String body, List<Catalogue.Event> events, String target, boolean test) {
        Intent open = new Intent(context, MainActivity.class).setAction("uk.co.nicole.whatshappening.OPEN." + target);
        open.putExtra("event", target); open.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent content = PendingIntent.getActivity(context, id, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder builder = new Notification.Builder(context, CHANNEL).setSmallIcon(R.drawable.ic_star)
            .setContentTitle(title).setContentText(body).setContentIntent(content).setAutoCancel(true)
            .setColor(0xFF7752D8).setCategory(Notification.CATEGORY_EVENT).setShowWhen(true);
        if (events.size() > 1 && !test) {
            Notification.InboxStyle style = new Notification.InboxStyle().setBigContentTitle(title);
            for (Catalogue.Event event : events) style.addLine(event.title);
            builder.setStyle(style);
        } else builder.setStyle(new Notification.BigTextStyle().bigText(body));
        context.getSystemService(NotificationManager.class).notify(id, builder.build());
    }
}
