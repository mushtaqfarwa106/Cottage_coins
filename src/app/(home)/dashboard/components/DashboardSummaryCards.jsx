import { Wallet, CreditCard, Scale, ListOrdered } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "../utils/format";
import { DashboardCardDecoration } from "./DashboardCardDecoration";

const cards = [
  {
    title: "Total Income this month",
    dataKey: "totalIncome",
    bgClass: "bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border-emerald-200/80 dark:border-emerald-900/50",
    valueClass: "text-emerald-700 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    Icon: Wallet,
    format: (v) => formatCurrency(v),
  },
  {
    title: "Total Expenses this month",
    dataKey: "totalExpenses",
    bgClass: "bg-linear-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/30 border-rose-200/80 dark:border-rose-900/50",
    valueClass: "text-rose-700 dark:text-rose-400",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    iconClass: "text-rose-600 dark:text-rose-400",
    Icon: CreditCard,
    format: (v) => formatCurrency(v),
  },
  {
    title: "Net Balance this month",
    dataKey: "netBalance",
    bgClass: "bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-200/80 dark:border-blue-900/50",
    valueClass: "text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconClass: "text-blue-600 dark:text-blue-400",
    Icon: Scale,
    format: (v) => formatCurrency(v),
  },
  {
    title: "Total Transactions this month",
    dataKey: "transactionCount",
    bgClass: "bg-linear-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 border-violet-200/80 dark:border-violet-900/50",
    valueClass: "text-violet-700 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconClass: "text-violet-600 dark:text-violet-400",
    Icon: ListOrdered,
    format: (v) => String(v ?? 0),
  },
];

export function DashboardSummaryCards({
  totalIncome,
  totalExpenses,
  netBalance,
  transactionCount,
}) {
  const values = { totalIncome, totalExpenses, netBalance, transactionCount };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, dataKey, bgClass, valueClass, iconBg, iconClass, Icon, format }) => (
        <Card key={dataKey} className={`relative overflow-hidden ${bgClass}`}>
          <DashboardCardDecoration className="pointer-events-none absolute -right-1 -top-1 size-28 text-muted-foreground/20" />
          <CardHeader className="relative z-1 pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-medium leading-snug text-muted-foreground">
                {title}
              </CardTitle>
              <div className={`rounded-lg p-2 shrink-0 ${iconBg}`}>
                <Icon className={`size-5 ${iconClass}`} aria-hidden strokeWidth={1.75} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-1">
            <p className={`text-2xl font-bold tabular-nums ${valueClass}`}>{format(values[dataKey])}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
