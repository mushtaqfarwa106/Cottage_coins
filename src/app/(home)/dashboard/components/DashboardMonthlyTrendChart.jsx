"use client";

import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../utils/format";
import { DashboardEmptyChartIllustration } from "./DashboardEmptyChartIllustration";

export function DashboardMonthlyTrendChart({ monthlyTrend }) {
  const data = monthlyTrend ?? [];
  const hasData = data.some((d) => (d.income ?? 0) > 0 || (d.expense ?? 0) > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly trend</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-4 py-8 text-center sm:flex-row sm:gap-8 sm:py-10">
            <DashboardEmptyChartIllustration className="h-28 w-40 shrink-0 text-muted-foreground sm:h-32 sm:w-44" />
            <div className="max-w-sm space-y-2">
              <p className="text-sm font-medium text-foreground">No trend data yet</p>
              <p className="text-sm text-muted-foreground">
                Add income and expense transactions to see your last six months on this chart.
              </p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link href="/transactions">Go to transactions</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tickFormatter={(v) => formatCurrency(v)} width={72} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: "var(--foreground)" }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
