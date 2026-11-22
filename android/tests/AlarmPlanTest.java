package uk.co.nicole.whatshappening;

import java.time.*;
import java.util.*;

public final class AlarmPlanTest {
    private static void equal(Object actual, Object expected) {
        if (!Objects.equals(actual, expected)) throw new AssertionError(actual + " != " + expected);
    }
    public static void main(String[] args) {
        List<String> dates = Arrays.asList("2026-11-22", "2026-11-23", "2026-12-01");
        ZoneId london = ZoneId.of("Europe/London");
        equal(AlarmPlan.next(dates, "09:00", london, Instant.parse("2026-11-22T08:00:00Z"), Collections.emptySet()), Instant.parse("2026-11-22T09:00:00Z"));
        equal(AlarmPlan.next(dates, "09:00", london, Instant.parse("2026-11-22T10:00:00Z"), Collections.emptySet()), Instant.parse("2026-11-23T09:00:00Z"));
        equal(AlarmPlan.next(dates, "09:00", london, Instant.parse("2026-11-22T08:00:00Z"), Collections.singleton("2026-11-22")), Instant.parse("2026-11-23T09:00:00Z"));
        equal(AlarmPlan.next(dates, "09:00", ZoneId.of("Asia/Famagusta"), Instant.parse("2026-11-22T06:00:00Z"), Collections.emptySet()), Instant.parse("2026-11-22T07:00:00Z"));
        equal(AlarmPlan.next(dates, "09:00", london, Instant.parse("2027-01-01T00:00:00Z"), Collections.emptySet()), null);
        equal(AlarmPlan.next(Collections.emptyList(), "08:00", london, Instant.now(), Collections.emptySet()), null);
        equal(AlarmPlan.validTime("24:00"), false);
        equal(AlarmPlan.validTime("08:61"), false);
        equal(AlarmPlan.validTime("08:00"), true);
        // DST gap: 01:30 local is skipped in London; java.time shifts it forward.
        equal(AlarmPlan.next(Collections.singletonList("2027-03-28"), "01:30", london, Instant.parse("2027-03-27T00:00:00Z"), Collections.emptySet()), Instant.parse("2027-03-28T01:30:00Z"));
        // DST overlap: use the first occurrence, then advance after it has passed.
        equal(AlarmPlan.next(Arrays.asList("2026-10-25", "2026-10-26"), "01:30", london, Instant.parse("2026-10-25T01:00:00Z"), Collections.emptySet()), Instant.parse("2026-10-26T01:30:00Z"));
        System.out.println("Android scheduling rules: 11 checks passed.");
    }
}
