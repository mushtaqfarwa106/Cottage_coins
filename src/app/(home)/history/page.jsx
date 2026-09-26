"use client";

import { useEffect, useMemo, useState } from "react";
import { historyAPI } from "@/lib/api/history";
import { HistoryPageHeader } from "./components/HistoryPageHeader";
import { HistoryDateRangeSelector } from "./components/HistoryDateRangeSelector";
import { RunningBalanceChart } from "./components/RunningBalanceChart";
import { CategorySpendingTrendChart } from "./components/CategorySpendingTrendChart";
import { TopTransactionsCards } from "./components/TopTransactionsCards";
import { TimelineFeed } from "./components/TimelineFeed";
import { HistorySkeleton } from "./components/HistorySkeleton";

function toDateInputValue(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultDateRange() {
  const now = new Date();
  const to = new Date(now);
  const from = new Date(now);
  from.setDate(from.getDate() - 29);
  return {
    from: toDateInputValue(from),
    to: toDateInputValue(to),
  };
}

const emptyHistory = {
  runningBalance: [],
  topTransactions: { topIncome: [], topExpenses: [] },
  categoryTrend: [],
  groupedTransactions: [],
};

export default function HistoryPage() {
  const defaults = useMemo(() => defaultDateRange(), []);
  const [draftFrom, setDraftFrom] = useState(defaults.from);
  const [draftTo, setDraftTo] = useState(defaults.to);
  const [appliedFrom, setAppliedFrom] = useState(defaults.from);
  const [appliedTo, setAppliedTo] = useState(defaults.to);
  const [historyData, setHistoryData] = useState(emptyHistory);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const from = String(appliedFrom).trim();
    const to = String(appliedTo).trim();
    if (!from || !to || from > to) return;

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await historyAPI.getHistory({ dateFrom: from, dateTo: to });
        if (cancelled) return;
        setHistoryData({
          runningBalance: data.runningBalance ?? [],
          topTransactions: {
            topIncome: data.topTransactions?.topIncome ?? [],
            topExpenses: data.topTransactions?.topExpenses ?? [],
          },
          categoryTrend: data.categoryTrend ?? [],
          groupedTransactions: data.groupedTransactions ?? [],
        });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load history");
        setHistoryData(emptyHistory);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appliedFrom, appliedTo]);

  const handleApply = () => {
    const from = String(draftFrom).trim();
    const to = String(draftTo).trim();
    if (!from || !to) {
      setError("Please select both from and to dates.");
      return;
    }
    if (from > to) {
      setError("From date must be before or equal to To date.");
      return;
    }
    setAppliedFrom(from);
    setAppliedTo(to);
  };

  return (
    <div className="space-y-6">
      <HistoryPageHeader />

      <HistoryDateRangeSelector
        draftFrom={draftFrom}
        draftTo={draftTo}
        onDraftFromChange={(value) => {
          setDraftFrom(value);
          if (draftTo && value && draftTo < value) {
            setDraftTo(value);
          }
        }}
        onDraftToChange={setDraftTo}
        onApply={handleApply}
        isApplying={isLoading}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <HistorySkeleton />
      ) : (
        <div className="space-y-6">
          <RunningBalanceChart runningBalance={historyData.runningBalance} />

          <CategorySpendingTrendChart categoryTrend={historyData.categoryTrend} />

          <TopTransactionsCards
            topIncome={historyData.topTransactions?.topIncome}
            topExpenses={historyData.topTransactions?.topExpenses}
          />

          <TimelineFeed
            groupedTransactions={historyData.groupedTransactions}
            selectedDate=""
          />
        </div>
      )}
    </div>
  );
}
