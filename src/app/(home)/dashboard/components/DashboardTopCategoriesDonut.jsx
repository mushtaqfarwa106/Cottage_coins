"use client";

import Link from "next/link";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../utils/format";
import { DashboardEmptyIllustration } from "./DashboardEmptyIllustration";

export function DashboardTopCategoriesDonut({ topCategories }) {
  const rows = (topCategories ?? []).filter((r) => (r.amount ?? 0) > 0);
  const pieData = rows.map((r) => ({
    name: r.name,
    value: r.amount,
    color: r.color || "#64748b",
  }));

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Top spending categories</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
          <Link href="/categories">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!pieData.length ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:justify-center sm:gap-6 sm:py-8">
            <DashboardEmptyIllustration
              variant="pie"
              className="h-24 w-32 shrink-0 text-muted-foreground sm:h-28 sm:w-36"
            />
            <div className="max-w-xs space-y-2">
              <p className="text-sm font-medium text-foreground">No spending breakdown</p>
              <p className="text-sm text-muted-foreground">
                Record expenses with categories this month to see your top categories here.
              </p>
              <Button variant="outline" size="sm" className="mt-1" asChild>
                <Link href="/transactions">Go to transactions</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto h-[200px] w-full max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-sm">
              {rows.map((row) => (
                <li key={row.name} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color || "#64748b" }}
                    />
                    <span className="truncate">{row.name}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{formatCurrency(row.amount)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
