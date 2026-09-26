import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import EmailReportSetting from "@/models/EmailReportSetting";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

function isValidEmail(value) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(String(value || "").trim());
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const [setting, user] = await Promise.all([
      EmailReportSetting.findOne({ user: userId }).lean(),
      User.findById(userId).lean(),
    ]);

    return NextResponse.json(
      {
        email: setting?.email || user?.email || "",
        frequency: setting?.frequency || "monthly",
        enabled: Boolean(setting?.enabled),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Email settings GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email, frequency, enabled } = await request.json();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!["monthly", "yearly"].includes(frequency)) {
      return NextResponse.json({ error: 'frequency must be "monthly" or "yearly"' }, { status: 400 });
    }
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "enabled must be boolean" }, { status: 400 });
    }

    await connectDB();
    const setting = await EmailReportSetting.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        email: String(email).trim().toLowerCase(),
        frequency,
        enabled,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json(
      {
        message: "Email report settings saved",
        settings: {
          email: setting.email,
          frequency: setting.frequency,
          enabled: setting.enabled,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Email settings POST error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
