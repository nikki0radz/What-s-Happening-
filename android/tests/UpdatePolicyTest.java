package uk.co.nicole.whatshappening;

public final class UpdatePolicyTest {
    private static int checks;
    private static void expect(boolean result, String message) { checks++; if (!result) throw new AssertionError(message); }
    public static void main(String[] args) {
        String url = "https://nikki0radz.github.io/What-s-Happening-/downloads/Whats-Happening-0.4.0.apk";
        expect(UpdatePolicy.valid(UpdatePolicy.PACKAGE,4,"0.4.0",26,url), "valid official release");
        expect(!UpdatePolicy.valid("another.app",4,"0.4.0",26,url), "wrong package");
        expect(!UpdatePolicy.valid(UpdatePolicy.PACKAGE,0,"0.4.0",26,url), "invalid version code");
        expect(!UpdatePolicy.valid(UpdatePolicy.PACKAGE,4,"bad",26,url), "invalid version name");
        for (String bad : new String[]{url.replace("https:","http:"),url.replace("nikki0radz.github.io","evil.example"),url.replace("downloads/","downloads/../"),url+"?next=evil",url+"#fragment",url.replace("github.io/","github.io:443/"),url.replace("github.io/","github.io@evil.example/"),url.replace("0.4.0.apk","0.3.0.apk"),url.replace("downloads/","downloads/%2e%2e/")}) {
            expect(!UpdatePolicy.valid(UpdatePolicy.PACKAGE,4,"0.4.0",26,bad), "reject altered URL: " + bad);
        }
        expect(UpdatePolicy.newer(3,4,35,26), "newer compatible release");
        expect(!UpdatePolicy.newer(4,4,35,26), "same version");
        expect(!UpdatePolicy.newer(5,4,35,26), "never downgrade");
        expect(!UpdatePolicy.newer(3,4,26,28), "incompatible phone");
        expect(UpdatePolicy.shouldCheck(false,1000,0), "first launch");
        expect(!UpdatePolicy.shouldCheck(false,1001,1000), "automatic checks throttled");
        expect(UpdatePolicy.shouldCheck(true,1001,1000), "manual check bypasses throttle");
        expect(UpdatePolicy.shouldCheck(false,1000+UpdatePolicy.INTERVAL,1000), "automatic check due");
        expect(UpdatePolicy.shouldCheck(false,900,1000), "clock change cannot block checks");
        System.out.println(checks + " update policy checks passed.");
    }
}
