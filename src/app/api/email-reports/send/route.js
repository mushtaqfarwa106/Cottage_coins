import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { sendEmailReportForUser, getUserEmailReportSettingWithFallback } from "@/lib/email/send-report";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { period } = await request.json();
    if (!["monthly", "yearly"].includes(period)) {
      return NextResponse.json({ error: 'period must be "monthly" or "yearly"' }, { status: 400 });
    }

    await connectDB();
    const setting = await getUserEmailReportSettingWithFallback(userId);
    if (!setting.email) {
      return NextResponse.json(
        { error: "No destination email found. Please save email settings first." },
        { status: 400 }
      );
    }

    const result = await sendEmailReportForUser({
      userId,
      toEmail: setting.email,
      period,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error?.message || "Failed to send email report" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Report email sent successfully",
        sentAt: result.log.sentAt,
        period: result.log.period,
        status: result.log.status,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Email send POST error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
