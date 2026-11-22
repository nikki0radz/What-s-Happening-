package uk.co.nicole.whatshappening;

import java.time.*;
import java.util.*;

/** Pure scheduling rules, shared with host-side tests. No Android dependencies. */
public final class AlarmPlan {
    private AlarmPlan() {}
    public static boolean validTime(String time) {
        return time != null && time.matches("([01][0-9]|2[0-3]):[0-5][0-9]");
    }
    public static Instant next(List<String> dates, String time, ZoneId zone, Instant now, Set<String> completed) {
        if (!validTime(time)) throw new IllegalArgumentException("Invalid reminder time");
        List<String> sorted = new ArrayList<>(dates);
        Collections.sort(sorted);
        for (String date : sorted) {
            if (completed.contains(date)) continue;
            Instant candidate = LocalDate.parse(date).atTime(LocalTime.parse(time)).atZone(zone).toInstant();
            if (candidate.isAfter(now)) return candidate;
        }
        return null;
    }
}
