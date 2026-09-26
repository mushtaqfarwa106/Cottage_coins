import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import EmailReport from "@/models/EmailReport";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const logs = await EmailReport.find({ user: userId })
      .sort({ sentAt: -1, _id: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(
      {
        history: logs.map((log) => ({
          id: String(log._id),
          date: log.sentAt,
          period: log.period,
          status: log.status,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Email history GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
