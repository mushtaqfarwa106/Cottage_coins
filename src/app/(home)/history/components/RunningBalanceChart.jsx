"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatCurrency } from "../utils/format";

export function RunningBalanceChart({ runningBalance }) {
  const data = runningBalance ?? [];
  const hasData = data.length > 0;
  const endingBalance = hasData ? data[data.length - 1].balance ?? 0 : 0;
  const strokeColor = endingBalance >= 0 ? "#16a34a" : "#dc2626";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Running balance</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No balance data for this range.
          </div>
        ) : (
          <div className="h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} width={68} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: "var(--foreground)" }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={strokeColor}
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
