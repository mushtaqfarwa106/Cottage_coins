import { registerEmailReportsCron } from "@/lib/cron/emailReports";

export function initCronJobs() {
  if (process.env.DISABLE_CRON === "true") return;
  registerEmailReportsCron();
}
