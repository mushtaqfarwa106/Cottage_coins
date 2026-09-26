import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Transaction from "@/models/Transaction";
import Category from "@/models/Category";

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

function parseYMD(str) {
  const [y, m, day] = String(str).split("-").map(Number);
  if (!y || !m || !day) return null;
  const parsed = new Date(y, m - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateKey(d) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateRangeKeys(start, end) {
  const keys = [];
  const cursor = startOfDay(start);
  const finalDay = startOfDay(end);
  while (cursor <= finalDay) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function formatMonthLabel(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function monthStartDate(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function monthKeyFromDate(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
}

function monthRange(start, end) {
  const months = [];
  const cursor = monthStartDate(start);
  const finish = monthStartDate(end);
  while (cursor <= finish) {
    months.push({
      key: monthKeyFromDate(cursor),
      label: formatMonthLabel(cursor),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export async function GET(request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: "Both dateFrom and dateTo are required for history" },
        { status: 400 }
      );
    }

    const parsedFrom = parseYMD(dateFrom);
    const parsedTo = parseYMD(dateTo);
    if (!parsedFrom || !parsedTo) {
      return NextResponse.json(
        { error: "Invalid dateFrom or dateTo format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const start = startOfDay(parsedFrom);
    const end = endOfDay(parsedTo);
    if (start > end) {
      return NextResponse.json({ error: "dateFrom must be before or equal to dateTo" }, { status: 400 });
    }

    await connectDB();

    const [transactions, allCategories] = await Promise.all([
      Transaction.find({
        user: userId,
        date: { $gte: start, $lte: end },
      })
        .populate("category", "name color")
        .sort({ date: 1, _id: 1 })
        .lean(),
      Category.find({ user: userId }).sort({ name: 1 }).lean(),
    ]);

    const rangeKeys = dateRangeKeys(start, end);
    const months = monthRange(start, end);
    const netByDay = new Map();
    const countByDay = new Map();
    const expenseByMonthCategory = new Map();

    for (const tx of transactions) {
      const key = toDateKey(tx.date);
      const signedAmount = tx.type === "income" ? tx.amount : -tx.amount;
      netByDay.set(key, (netByDay.get(key) ?? 0) + signedAmount);
      countByDay.set(key, (countByDay.get(key) ?? 0) + 1);

      if (tx.type === "expense") {
        const monthKey = monthKeyFromDate(tx.date);
        if (!expenseByMonthCategory.has(monthKey)) {
          expenseByMonthCategory.set(monthKey, new Map());
        }
        const monthMap = expenseByMonthCategory.get(monthKey);
        const categoryName = tx.category?.name ?? "Unknown";
        const categoryColor = tx.category?.color ?? "#64748b";
        const existing = monthMap.get(categoryName) ?? { name: categoryName, color: categoryColor, amount: 0 };
        existing.amount += tx.amount ?? 0;
        monthMap.set(categoryName, existing);
      }
    }

    let cumulative = 0;
    const runningBalance = rangeKeys.map((key) => {
      cumulative += netByDay.get(key) ?? 0;
      return { date: key, balance: cumulative };
    });

    const activityHeatmap = rangeKeys.map((key) => ({
      date: key,
      count: countByDay.get(key) ?? 0,
    }));

    const categoryDefinitions = allCategories.map((category) => ({
      name: category.name,
      color: category.color || "#64748b",
    }));

    const categoryTrend = months.map((month) => {
      const monthMap = expenseByMonthCategory.get(month.key) ?? new Map();
      const categories = categoryDefinitions.map((category) => ({
        name: category.name,
        color: category.color,
        amount: monthMap.get(category.name)?.amount ?? 0,
      }));
      return {
        month: month.label,
        categories,
      };
    });

    const topIncome = transactions
      .filter((tx) => tx.type === "income")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((tx) => ({
        name: tx.name,
        amount: tx.amount,
        category: {
          name: tx.category?.name ?? "Unknown",
          color: tx.category?.color ?? "#64748b",
        },
        date: tx.date,
      }));

    const topExpenses = transactions
      .filter((tx) => tx.type === "expense")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((tx) => ({
        name: tx.name,
        amount: tx.amount,
        category: {
          name: tx.category?.name ?? "Unknown",
          color: tx.category?.color ?? "#64748b",
        },
        date: tx.date,
      }));

    const groupedMap = new Map();
    for (const tx of transactions) {
      const month = formatMonthLabel(tx.date);
      if (!groupedMap.has(month)) {
        groupedMap.set(month, { month, totals: { income: 0, expense: 0 }, transactions: [] });
      }
      const group = groupedMap.get(month);
      if (tx.type === "income") group.totals.income += tx.amount;
      else group.totals.expense += tx.amount;
      group.transactions.push({
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
      });
    }

    const groupedTransactions = Array.from(groupedMap.values())
      .map((group) => ({
        ...group,
        transactions: group.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
      }))
      .sort((a, b) => new Date(b.transactions[0]?.date ?? 0) - new Date(a.transactions[0]?.date ?? 0));

    return NextResponse.json(
      {
        runningBalance,
        topTransactions: { topIncome, topExpenses },
        activityHeatmap,
        categoryTrend,
        groupedTransactions,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.error("History GET error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
