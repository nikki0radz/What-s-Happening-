package uk.co.nicole.whatshappening;

import java.net.URI;

/** Pure validation and timing rules, shared by the checker and JVM tests. */
public final class UpdatePolicy {
    public static final String PACKAGE = "uk.co.nicole.whatshappening";
    public static final String FEED = "https://nikki0radz.github.io/What-s-Happening-/app-update.json";
    public static final long INTERVAL = 15 * 60 * 1000L;

    public static boolean shouldCheck(boolean manual, long now, long previousAttempt) {
        return manual || previousAttempt == 0 || now < previousAttempt || now - previousAttempt >= INTERVAL;
    }
    public static boolean valid(String packageName, long code, String name, int minSdk, String apkUrl) {
        if (!PACKAGE.equals(packageName) || code <= 0 || name == null || !name.matches("[0-9]+\\.[0-9]+\\.[0-9]+") || minSdk < 26) return false;
        try {
            URI uri = new URI(apkUrl);
            return "https".equals(uri.getScheme()) && "nikki0radz.github.io".equals(uri.getHost())
                && uri.getPort() == -1 && uri.getUserInfo() == null && uri.getQuery() == null && uri.getFragment() == null
                && uri.getRawPath().equals("/What-s-Happening-/downloads/Whats-Happening-" + name + ".apk");
        } catch (Exception ignored) { return false; }
    }
    public static boolean newer(long installed, long latest, int phoneSdk, int minSdk) {
        return latest > installed && phoneSdk >= minSdk;
    }
}
