import cron from "node-cron";

const MONTHLY_EXPRESSION = "0 5 1 * *";
const YEARLY_EXPRESSION = "0 6 1 1 *";

function scheduleTrigger(period, expression) {
  return cron.schedule(expression, async () => {
    const appUrl = process.env.APP_URL;
    const cronSecret = process.env.EMAIL_REPORTS_CRON_SECRET;
    if (!appUrl || !cronSecret) {
      return;
    }

    const url = `${appUrl.replace(/\/$/, "")}/api/email-reports/cron`;
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": cronSecret,
        },
        body: JSON.stringify({ period }),
      });
    } catch (error) {
      console.error(`[email-reports-cron] ${period} trigger failed:`, error);
    }
  });
}

export function registerEmailReportsCron() {
  if (global.__emailReportsCronInitialized) return;
  global.__emailReportsCronInitialized = true;

  scheduleTrigger("monthly", MONTHLY_EXPRESSION);
  scheduleTrigger("yearly", YEARLY_EXPRESSION);
}
