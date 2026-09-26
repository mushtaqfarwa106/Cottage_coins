"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatPkr(value) {
  const amount = Number(value ?? 0);
  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rs ${formatted}`;
}

function normalizeTrendData(categoryTrend) {
  const source = categoryTrend ?? [];
  const categoryMeta = new Map();
  const rows = source.map((monthRow) => {
    const row = { month: monthRow.month };
    for (const c of monthRow.categories ?? []) {
      row[c.name] = c.amount ?? 0;
      if (!categoryMeta.has(c.name)) {
        categoryMeta.set(c.name, { name: c.name, color: c.color || "#64748b" });
      }
    }
    return row;
  });

  const categoryList = Array.from(categoryMeta.values());
  for (const row of rows) {
    for (const category of categoryList) {
      if (row[category.name] === undefined) row[category.name] = 0;
    }
  }

  return { rows, categoryList };
}

export function CategorySpendingTrendChart({ categoryTrend }) {
  const { rows, categoryList } = normalizeTrendData(categoryTrend);
  const hasData = rows.some((row) => categoryList.some((category) => (row[category.name] ?? 0) > 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Category spending trend</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No spending transactions in this range.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => formatPkr(value)} width={78} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => formatPkr(value)}
                    labelStyle={{ color: "var(--foreground)" }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  {categoryList.map((category) => (
                    <Line
                      key={category.name}
                      type="monotone"
                      dataKey={category.name}
                      name={category.name}
                      stroke={category.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3.5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-3">
              {categoryList.map((category) => (
                <div key={category.name} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
