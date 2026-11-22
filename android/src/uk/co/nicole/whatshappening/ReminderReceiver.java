package uk.co.nicole.whatshappening;

import android.content.*;

public final class ReminderReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        ReminderScheduler.createChannel(context);
        if (intent.getAction() != null && intent.getAction().startsWith("uk.co.nicole.whatshappening.REMIND.")) {
            ReminderScheduler.deliver(context, intent.getIntExtra("kind", 0), intent.getStringExtra("date"));
        } else ReminderScheduler.reschedule(context);
    }
}
