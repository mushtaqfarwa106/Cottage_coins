"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../utils/format";

export function ReportCategorySection({ categoryBreakdown }) {
  const rows = categoryBreakdown ?? [];
  const expenseRows = rows.filter((r) => r.type === "expense" && r.totalAmount > 0);
  const totalExpense = expenseRows.reduce((s, r) => s + r.totalAmount, 0);
  const totalIncome = rows
    .filter((r) => r.type === "income" && r.totalAmount > 0)
    .reduce((s, r) => s + r.totalAmount, 0);

  const pieData = expenseRows.map((r) => ({
    name: r.name,
    value: r.totalAmount,
    color: r.color,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by category</CardTitle>
        </CardHeader>
        <CardContent>
          {!pieData.length || totalExpense <= 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No expense data to chart for this period.
            </div>
          ) : (
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={100}
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category breakdown</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {!rows.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No category data.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">% of total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => {
                  const denom = row.type === "expense" ? totalExpense : totalIncome;
                  const pct = denom > 0 ? (row.totalAmount / denom) * 100 : 0;
                  return (
                    <TableRow key={`${row.name}-${row.type}-${idx}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            className="shrink-0 border-0 text-white"
                            style={{ backgroundColor: row.color }}
                          >
                            {row.name}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{row.type}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(row.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {pct.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
