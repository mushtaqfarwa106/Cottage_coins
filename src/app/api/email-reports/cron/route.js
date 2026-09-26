import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailReportSetting from "@/models/EmailReportSetting";
import { sendEmailReportForUser } from "@/lib/email/send-report";

function isAuthorizedCronRequest(request) {
  const expected = process.env.EMAIL_REPORTS_CRON_SECRET;
  if (!expected) return false;
  return request.headers.get("x-cron-secret") === expected;
}

export async function POST(request) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { period } = await request.json();
    if (!["monthly", "yearly"].includes(period)) {
      return NextResponse.json({ error: 'period must be "monthly" or "yearly"' }, { status: 400 });
    }

    await connectDB();

    const settings = await EmailReportSetting.find({
      enabled: true,
      frequency: period,
    }).lean();

    let sent = 0;
    let failed = 0;

    for (const setting of settings) {
      if (!setting.email) continue;
      const result = await sendEmailReportForUser({
        userId: setting.user,
        toEmail: setting.email,
        period,
      });
      if (result.ok) sent += 1;
      else failed += 1;
    }

    return NextResponse.json(
      {
        message: "Cron email report run completed",
        period,
        totalUsers: settings.length,
        sent,
        failed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email cron POST error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
