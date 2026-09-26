import { AlertTriangle, Info, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function InsightIcon({ type }) {
  if (type === "warning") return <AlertTriangle className="size-5 text-rose-600 shrink-0" />;
  if (type === "positive") return <TrendingUp className="size-5 text-emerald-600 shrink-0" />;
  return <Info className="size-5 text-muted-foreground shrink-0" />;
}

function borderClass(type) {
  if (type === "warning") return "border-l-rose-500";
  if (type === "positive") return "border-l-emerald-500";
  return "border-l-muted-foreground/50";
}

export function ForecastInsightsList({ insights }) {
  const rows = insights ?? [];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Spending pattern insights</h2>
      {!rows.length ? (
        <p className="text-sm text-muted-foreground">No insights returned.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((insight, idx) => (
            <li key={`${insight.title}-${idx}`}>
              <Card className={cn("border-l-4 shadow-sm", borderClass(insight.type))}>
                <CardContent className="flex gap-3 pt-6">
                  <InsightIcon type={insight.type} />
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{insight.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
