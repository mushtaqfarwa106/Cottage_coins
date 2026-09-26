import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "../utils/format";

export function ForecastBudgetGrid({ budgetRecommendations }) {
  const rows = budgetRecommendations ?? [];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Budget recommendations</h2>
      {!rows.length ? (
        <p className="text-sm text-muted-foreground">No budget recommendations returned.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const current = Number(row.currentAvg) || 0;
            const suggested = Number(row.suggestedBudget) || 0;
            const pct =
              suggested > 0 ? Math.min(100, Math.round((current / suggested) * 100)) : 0;
            return (
              <Card key={row.category} className="overflow-hidden">
                <div className="h-1 w-full" style={{ backgroundColor: row.color || "#6366f1" }} />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span
                      className="size-3 shrink-0 rounded-full ring-2 ring-white dark:ring-card"
                      style={{ backgroundColor: row.color || "#6366f1" }}
                    />
                    {row.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Current avg / mo</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(current)}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Suggested budget</span>
                    <span className="font-semibold tabular-nums text-primary">{formatCurrency(suggested)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Usage vs suggested</span>
                      <span className={pct >= 100 ? "text-rose-600 font-medium" : pct >= 80 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: pct >= 100 ? "#f43f5e" : pct >= 80 ? "#f59e0b" : (row.color || "#6366f1"),
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{row.reason}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
