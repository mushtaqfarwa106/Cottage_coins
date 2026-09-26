import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Transaction from "@/models/Transaction";

void Category;

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

function startOfMonth(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonth(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

function formatMonthLabel(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

function monthStartAtOffset(now, monthsBackFromCurrent) {
  return startOfMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBackFromCurrent, 1)));
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const now = new Date();
    const currentStart = startOfMonth(now);
    const currentEnd = endOfMonth(now);
    const trendStart = monthStartAtOffset(now, 5);
    const trendEnd = currentEnd;

    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    const matchCurrentMonth = {
      user: userObjectId,
      date: { $gte: currentStart, $lte: currentEnd },
    };
    const matchTrendRange = {
      user: userObjectId,
      date: { $gte: trendStart, $lte: trendEnd },
    };

    await connectDB();

    const [
      totalsAgg,
      transactionCount,
      trendAgg,
      topCatAgg,
      recentDocs,
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: matchCurrentMonth },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.countDocuments(matchCurrentMonth),
      Transaction.aggregate([
        { $match: matchTrendRange },
        {
          $group: {
            _id: { $dateTrunc: { date: "$date", unit: "month" } },
            income: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
            },
            expense: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Transaction.aggregate([
        { $match: { ...matchCurrentMonth, type: "expense" } },
        {
          $group: {
            _id: "$category",
            amount: { $sum: "$amount" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
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
            amount: 1,
          },
        },
        { $sort: { amount: -1 } },
        { $limit: 3 },
      ]),
      Transaction.find({ user: userObjectId })
        .sort({ date: -1, _id: -1 })
        .limit(5)
        .populate("category", "name color")
        .lean(),
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    for (const row of totalsAgg) {
      if (row._id === "income") totalIncome = row.total ?? 0;
      if (row._id === "expense") totalExpenses = row.total ?? 0;
    }

    const trendByKey = new Map();
    for (const row of trendAgg) {
      const key = new Date(row._id).getTime();
      trendByKey.set(key, { income: row.income ?? 0, expense: row.expense ?? 0 });
    }

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i -= 1) {
      const monthStart = monthStartAtOffset(now, i);
      const key = monthStart.getTime();
      const bucket = trendByKey.get(key) ?? { income: 0, expense: 0 };
      monthlyTrend.push({
        month: formatMonthLabel(monthStart),
        income: bucket.income,
        expense: bucket.expense,
      });
    }

    const topCategories = topCatAgg.map((row) => ({
      name: row.name,
      color: row.color,
      amount: row.amount ?? 0,
    }));

    const recentTransactions = recentDocs.map((tx) => ({
      _id: String(tx._id),
      name: tx.name,
      amount: tx.amount,
      type: tx.type,
      date: tx.date,
      paymentMethod: tx.paymentMethod,
      category: {
        name: tx.category?.name ?? "Unknown",
        color: tx.category?.color ?? "#64748b",
      },
    }));

    return NextResponse.json(
      {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        transactionCount,
        recentTransactions,
        monthlyTrend,
        topCategories,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
