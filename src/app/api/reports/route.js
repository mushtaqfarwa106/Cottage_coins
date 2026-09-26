import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Monday 00:00:00 local time for the ISO-style week that contains `d`. */
function startOfWeekMonday(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  const daysFromMonday = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - daysFromMonday);
  return x;
}

/** Sunday 23:59:59.999 local for the same (Monday-based) week as `startOfWeekMonday(d)`. */
function endOfWeekSunday(d) {
  const start = startOfWeekMonday(d);
  const x = new Date(start);
  x.setDate(x.getDate() + 6);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseYMD(str) {
  const [y, m, day] = str.split("-").map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

/** Inclusive calendar days between start and end (both startOfDay) */
function inclusiveDaySpan(start, end) {
  const a = startOfDay(start).getTime();
  const b = startOfDay(end).getTime();
  return Math.floor((b - a) / 86400000) + 1;
}

/**
 * Returns { start, end, bucketUnit } where bucketUnit is "day" | "week" | "month" | "year"
 */
function resolveReportWindow(period, dateFrom, dateTo) {
  const now = new Date();
  let start;
  let end = endOfDay(now);
  let bucketUnit;

  const hasFrom = dateFrom && String(dateFrom).trim();
  const hasTo = dateTo && String(dateTo).trim();

  if (hasFrom || hasTo) {
    if (!hasFrom || !hasTo) {
      return { error: "Both dateFrom and dateTo are required for a custom range" };
    }
    const df = parseYMD(String(dateFrom));
    const dt = parseYMD(String(dateTo));
    if (!df || !dt || isNaN(df.getTime()) || isNaN(dt.getTime())) {
      return { error: "Invalid dateFrom or dateTo format. Use YYYY-MM-DD" };
    }
    start = startOfDay(df);
    end = endOfDay(dt);
    if (start > end) {
      return { error: "dateFrom must be before or equal to dateTo" };
    }
    const span = inclusiveDaySpan(start, end);
    if (span <= 31) bucketUnit = "day";
    else if (span <= 120) bucketUnit = "week";
    else bucketUnit = "month";
    return { start, end, bucketUnit, custom: true };
  }

  if (period === "weekly") {
    start = startOfWeekMonday(now);
    end = endOfWeekSunday(now);
    bucketUnit = "day";
  } else if (period === "yearly") {
    start = new Date(now.getFullYear() - 4, 0, 1);
    start = startOfDay(start);
    bucketUnit = "year";
  } else {
    start = startOfMonth(now);
    end = endOfMonth(now);
    bucketUnit = "day";
  }

  return { start, end, bucketUnit, custom: false };
}

function formatTrendLabel(date, bucketUnit) {
  const d = new Date(date);
  if (bucketUnit === "day") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (bucketUnit === "week") {
    const endWeek = new Date(d);
    endWeek.setDate(endWeek.getDate() + 6);
    const a = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const b = endWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${a} – ${b}`;
  }
  if (bucketUnit === "month") {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  return String(d.getFullYear());
}

export async function GET(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom && !dateTo && !["weekly", "monthly", "yearly"].includes(period)) {
      return NextResponse.json(
        { error: 'period must be "weekly", "monthly", or "yearly"' },
        { status: 400 }
      );
    }

    const windowResult = resolveReportWindow(period, dateFrom, dateTo);
    if (windowResult.error) {
      return NextResponse.json({ error: windowResult.error }, { status: 400 });
    }

    const { start, end, bucketUnit } = windowResult;
    const userObjectId = new mongoose.Types.ObjectId(String(userId));

    await connectDB();

    const matchStage = {
      user: userObjectId,
      date: { $gte: start, $lte: end },
    };

    const [totalsAgg, countAgg, trendAgg, categoryAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.countDocuments(matchStage),
      Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateTrunc: { date: "$date", unit: bucketUnit },
            },
            income: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
              },
            },
            expense: {
              $sum: {
                $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { category: "$category", type: "$type" },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id.category",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            name: { $ifNull: ["$cat.name", "Unknown"] },
            color: { $ifNull: ["$cat.color", "#64748b"] },
            totalAmount: 1,
            type: "$_id.type",
          },
        },
        { $sort: { type: 1, totalAmount: -1 } },
      ]),
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    for (const row of totalsAgg) {
      if (row._id === "income") totalIncome = row.total;
      if (row._id === "expense") totalExpenses = row.total;
    }

    const monthlyTrend = trendAgg.map((row) => ({
      month: formatTrendLabel(row._id, bucketUnit),
      income: row.income,
      expense: row.expense,
    }));

    const categoryBreakdown = categoryAgg.map((row) => ({
      name: row.name,
      color: row.color,
      totalAmount: row.totalAmount,
      type: row.type,
    }));

    return NextResponse.json(
      {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        monthlyTrend,
        categoryBreakdown,
        transactionCount: countAgg,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
