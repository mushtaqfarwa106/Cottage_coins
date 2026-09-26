import Transaction from "@/models/Transaction";

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

export function resolvePeriodWindow(period, now = new Date()) {
  if (period === "yearly") {
    const year = now.getFullYear() - 1;
    return {
      label: `${year} Financial Report`,
      start: startOfDay(new Date(year, 0, 1)),
      end: endOfDay(new Date(year, 11, 31)),
    };
  }

  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = prevMonth.getFullYear();
  const month = prevMonth.getMonth();
  const monthLabel = prevMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return {
    label: `${monthLabel} Financial Report`,
    start: startOfDay(new Date(year, month, 1)),
    end: endOfDay(new Date(year, month + 1, 0)),
  };
}

function normalizeTx(tx) {
  return {
    name: tx.name,
    amount: tx.amount ?? 0,
    category: tx.category?.name ?? "Unknown",
    date: tx.date,
  };
}

export async function buildEmailReportData({ userId, period, now = new Date() }) {
  const { start, end, label } = resolvePeriodWindow(period, now);

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: start, $lte: end },
  })
    .populate("category", "name")
    .sort({ date: -1, _id: -1 })
    .lean();

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals = new Map();

  for (const tx of transactions) {
    const amount = tx.amount ?? 0;
    if (tx.type === "income") {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
      const categoryName = tx.category?.name ?? "Unknown";
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) ?? 0) + amount);
    }
  }

  const topCategories = Array.from(categoryTotals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const topIncomeTransactions = transactions
    .filter((tx) => tx.type === "income")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
    .slice(0, 3)
    .map(normalizeTx);

  const topExpenseTransactions = transactions
    .filter((tx) => tx.type === "expense")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
    .slice(0, 3)
    .map(normalizeTx);

  return {
    period,
    periodLabel: label,
    window: {
      start,
      end,
    },
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    topCategories,
    topIncomeTransactions,
    topExpenseTransactions,
  };
}
