import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateShort, paymentMethodLabel } from "../utils/format";

export function TimelineFeed({ groupedTransactions, selectedDate }) {
  const [collapsedMonths, setCollapsedMonths] = useState({});

  const filteredGroups = useMemo(() => {
    const groups = groupedTransactions ?? [];
    if (!selectedDate) return groups;
    return groups
      .map((group) => ({
        ...group,
        transactions: (group.transactions ?? []).filter(
          (tx) => String(tx.date).slice(0, 10) === selectedDate
        ),
      }))
      .filter((group) => group.transactions.length > 0);
  }, [groupedTransactions, selectedDate]);

  const toggleMonth = (month) => {
    setCollapsedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transaction timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {!filteredGroups.length ? (
          <p className="text-sm text-muted-foreground">
            {selectedDate ? "No transactions for selected day." : "No transactions in this range."}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => {
              const isCollapsed = Boolean(collapsedMonths[group.month]);
              return (
                <div key={group.month} className="rounded-lg border border-border/80">
                  <button
                    type="button"
                    onClick={() => toggleMonth(group.month)}
                    className="w-full px-4 py-3 text-left flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-linear-to-r from-muted/60 to-transparent hover:from-muted/80 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{group.month}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.transactions.length} transaction
                        {group.transactions.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-emerald-600 mr-3">
                        Income: {formatCurrency(group.totals?.income ?? 0)}
                      </span>
                      <span className="text-rose-600">
                        Expense: {formatCurrency(group.totals?.expense ?? 0)}
                      </span>
                    </div>
                  </button>
                  {!isCollapsed && (
                    <div className="border-t border-border/70">
                      {(group.transactions ?? []).map((tx) => (
                        <div
                          key={tx._id}
                          className={[
                            "grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]",
                            "border-b border-border/60 last:border-b-0",
                            selectedDate ? "bg-primary/5" : "",
                          ].join(" ")}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: tx.category?.color || "#64748b" }}
                              />
                              <p className="text-sm font-medium truncate">{tx.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDateShort(tx.date)} • {paymentMethodLabel(tx.paymentMethod)} •{" "}
                              {tx.category?.name || "Unknown"}
                            </p>
                          </div>
                          <p
                            className={[
                              "text-sm font-semibold sm:text-right",
                              tx.type === "income" ? "text-emerald-600" : "text-rose-600",
                            ].join(" ")}
                          >
                            {tx.type === "income" ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
