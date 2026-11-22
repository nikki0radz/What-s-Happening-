package uk.co.nicole.whatshappening;

import android.content.Context;
import org.json.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

final class Catalogue {
    static final class Event {
        final String id, date, title, category;
        Event(JSONObject json) throws JSONException {
            id = json.getString("id"); date = json.getString("date");
            title = json.getString("title"); category = json.getString("category");
        }
    }
    private static List<Event> cached;
    static synchronized List<Event> all(Context context) {
        if (cached != null) return cached;
        List<Event> result = new ArrayList<>();
        try (InputStream input = context.getAssets().open("catalogue.json")) {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192]; int count;
            while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
            JSONArray array = new JSONArray(new String(output.toByteArray(), StandardCharsets.UTF_8));
            for (int i = 0; i < array.length(); i++) result.add(new Event(array.getJSONObject(i)));
        } catch (IOException | JSONException exception) {
            throw new IllegalStateException("Cannot load event catalogue", exception);
        }
        cached = Collections.unmodifiableList(result);
        return cached;
    }
    static List<Event> on(Context context, String date) {
        List<Event> result = new ArrayList<>();
        for (Event event : all(context)) if (event.date.equals(date)) result.add(event);
        return result;
    }
    static boolean contains(Context context, String id) {
        for (Event event : all(context)) if (event.id.equals(id)) return true;
        return false;
    }
}
