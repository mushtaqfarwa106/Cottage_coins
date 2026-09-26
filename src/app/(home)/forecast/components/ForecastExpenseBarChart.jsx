"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../utils/format";

/** Split long category names into up to two lines for horizontal axis labels. */
function splitCategoryLabel(text) {
  const t = String(text ?? "").trim();
  if (!t) return [""];
  if (t.length <= 18) return [t];
  const mid = Math.floor(t.length / 2);
  let at = t.lastIndexOf(" ", mid + 10);
  if (at < 6) at = t.indexOf(" ", mid);
  if (at <= 0) return [t.slice(0, 18), t.slice(18).trim()].filter(Boolean);
  const a = t.slice(0, at).trim();
  const b = t.slice(at + 1).trim();
  return b ? [a, b] : [a];
}

function CategoryAxisTick({ x, y, payload }) {
  const raw = typeof payload === "string" ? payload : payload?.value;
  const lines = splitCategoryLabel(raw);
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-muted-foreground text-[10px]">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 12 : 11}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function TrendIcon({ trend }) {
  if (trend === "up") return <ArrowUp className="size-4 text-rose-600" aria-hidden />;
  if (trend === "down") return <ArrowDown className="size-4 text-emerald-600" aria-hidden />;
  return <Minus className="size-4 text-muted-foreground" aria-hidden />;
}

export function ForecastExpenseBarChart({ forecast }) {
  const data = (forecast ?? []).map((row) => ({
    category: row.category,
    estimatedAmount: Number(row.estimatedAmount) || 0,
    trend: row.trend,
    color: row.color || "#64748b",
  }));
  const hasData = data.some((d) => d.estimatedAmount > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Next month expense forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData ? (
          <p className="text-sm text-muted-foreground">No category forecasts returned.</p>
        ) : (
          <>
            <div className="h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 44 }}>
                  <XAxis
                    dataKey="category"
                    tick={CategoryAxisTick}
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    interval={0}
                    height={48}
                    tickMargin={4}
                  />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} width={76} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="estimatedAmount" name="Estimated" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-3">
              {data.map((row) => (
                <li
                  key={row.category}
                  className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge
                      className="shrink-0 border-0 text-white"
                      style={{ backgroundColor: row.color }}
                    >
                      {row.category}
                    </Badge>
                    <span className="flex items-center gap-1" title={`Trend: ${row.trend}`}>
                      <TrendIcon trend={row.trend} />
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatCurrency(row.estimatedAmount)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
