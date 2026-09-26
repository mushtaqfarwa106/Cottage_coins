import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateShort } from "../utils/format";

function TopList({ title, rows, amountClass }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!rows.length ? (
          <p className="text-sm text-muted-foreground">No transactions in this range.</p>
        ) : (
          rows.map((row, idx) => (
            <div
              key={`${row.name}-${row.date}-${idx}`}
              className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {idx + 1}. {row.name}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    className="border-0 text-white"
                    style={{ backgroundColor: row.category?.color || "#64748b" }}
                  >
                    {row.category?.name || "Unknown"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDateShort(row.date)}</span>
                </div>
              </div>
              <p className={`text-sm font-semibold whitespace-nowrap ${amountClass}`}>
                {formatCurrency(row.amount)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function TopTransactionsCards({ topIncome, topExpenses }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TopList title="Top 5 Income" rows={topIncome ?? []} amountClass="text-emerald-600" />
      <TopList title="Top 5 Expenses" rows={topExpenses ?? []} amountClass="text-rose-600" />
    </div>
  );
}
