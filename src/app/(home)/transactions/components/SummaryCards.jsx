"use client";

import { TrendingUp, TrendingDown, Wallet, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "../utils";

export function SummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
  totalCount,
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border-emerald-200/80 dark:border-emerald-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-1.5">
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>
      <Card className="bg-linear-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/30 border-rose-200/80 dark:border-rose-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          <div className="rounded-lg bg-rose-100 dark:bg-rose-900/50 p-1.5">
            <TrendingDown className="size-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{formatCurrency(totalExpenses)}</p>
        </CardContent>
      </Card>
      <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-200/80 dark:border-blue-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 p-1.5">
            <Wallet className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-blue-700 dark:text-blue-400" : "text-rose-700 dark:text-rose-400"}`}>
            {formatCurrency(netBalance)}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-linear-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 border-violet-200/80 dark:border-violet-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          <div className="rounded-lg bg-violet-100 dark:bg-violet-900/50 p-1.5">
            <Hash className="size-4 text-violet-600 dark:text-violet-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">{totalCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
