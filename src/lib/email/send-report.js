import EmailReport from "@/models/EmailReport";
import User from "@/models/User";
import EmailReportSetting from "@/models/EmailReportSetting";
import { getMailTransporter } from "@/lib/email/transporter";
import { buildEmailReportData } from "@/lib/email/report-data";
import { buildEmailReportHtml } from "@/lib/email/template";

function sanitizeReportDataForLog(report) {
  return {
    totalIncome: report.totalIncome ?? 0,
    totalExpenses: report.totalExpenses ?? 0,
    netBalance: report.netBalance ?? 0,
    topCategories: report.topCategories ?? [],
    topIncomeTransactions: report.topIncomeTransactions ?? [],
    topExpenseTransactions: report.topExpenseTransactions ?? [],
  };
}

export async function sendEmailReportForUser({ userId, toEmail, period }) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  const report = await buildEmailReportData({ userId, period });
  const html = buildEmailReportHtml(report);

  const transporter = getMailTransporter();
  const from = process.env.EMAIL_FROM || "noreply@cottagecoins.local";
  const subject = `${report.periodLabel} - Cottage Coins`;

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      html,
    });

    const log = await EmailReport.create({
      user: userId,
      sentAt: new Date(),
      period,
      status: "sent",
      reportData: sanitizeReportDataForLog(report),
    });

    return { ok: true, log, report };
  } catch (error) {
    const log = await EmailReport.create({
      user: userId,
      sentAt: new Date(),
      period,
      status: "failed",
      reportData: sanitizeReportDataForLog(report),
    });
    return { ok: false, log, report, error };
  }
}

export async function getUserEmailReportSettingWithFallback(userId) {
  const [setting, user] = await Promise.all([
    EmailReportSetting.findOne({ user: userId }).lean(),
    User.findById(userId).lean(),
  ]);

  return {
    email: setting?.email || user?.email || "",
    frequency: setting?.frequency || "monthly",
    enabled: Boolean(setting?.enabled),
    hasSavedSetting: Boolean(setting),
  };
}
