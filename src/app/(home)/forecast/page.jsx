"use client";

import { useCallback, useEffect, useState } from "react";
import { aiForecastAPI } from "@/lib/api/ai-forecast";
import { authAPI } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { ForecastPageHeader } from "./components/ForecastPageHeader";
import { ForecastSummaryBanner } from "./components/ForecastSummaryBanner";
import { ForecastExpenseBarChart } from "./components/ForecastExpenseBarChart";
import { ForecastBudgetGrid } from "./components/ForecastBudgetGrid";
import { ForecastInsightsList } from "./components/ForecastInsightsList";
import { ForecastEmptyState } from "./components/ForecastEmptyState";
import { ForecastSkeleton } from "./components/ForecastSkeleton";
import { loadCachedForecast, saveCachedForecast } from "./utils/forecast-cache";

function normalizeResult(data) {
  return {
    summary: data.summary ?? "",
    forecast: data.forecast ?? [],
    budgetRecommendations: data.budgetRecommendations ?? [],
    insights: data.insights ?? [],
  };
}

export default function ForecastPage() {
  const [userId, setUserId] = useState(null);
  const [cacheChecked, setCacheChecked] = useState(false);
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await authAPI.getCurrentUser();
        if (cancelled) return;
        const id = user?.id != null ? String(user.id) : null;
        setUserId(id);
        if (id) {
          const cached = loadCachedForecast(id);
          if (cached) setResult(cached);
        }
      } finally {
        if (!cancelled) setCacheChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveUserId = useCallback(async () => {
    if (userId) return userId;
    const user = await authAPI.getCurrentUser();
    const id = user?.id != null ? String(user.id) : null;
    if (id) setUserId(id);
    return id;
  }, [userId]);

  const fetchForecast = useCallback(async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const data = await aiForecastAPI.generate();
      const normalized = normalizeResult(data);
      setResult(normalized);
      const id = await resolveUserId();
      if (id) saveCachedForecast(id, normalized);
    } catch (err) {
      setError(err.message || "Failed to generate forecast");
    } finally {
      setIsGenerating(false);
    }
  }, [resolveUserId]);

  const showResults = Boolean(result) && !isGenerating;
  const showEmpty = cacheChecked && !result && !isGenerating;

  return (
    <div className="space-y-6">
      <ForecastPageHeader
        onGenerate={fetchForecast}
        isGenerating={isGenerating}
        hasResult={Boolean(result)}
        cacheLoading={!cacheChecked}
      />

      {error && (
        <div className="flex flex-col gap-3 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={fetchForecast} className="shrink-0">
            Retry
          </Button>
        </div>
      )}

      {isGenerating ? (
        <ForecastSkeleton />
      ) : (
        <>
          {showEmpty && <ForecastEmptyState />}
          {showResults && (
            <>
              <ForecastSummaryBanner summary={result.summary} isLoading={false} />
              <ForecastExpenseBarChart forecast={result.forecast} />
              <ForecastBudgetGrid budgetRecommendations={result.budgetRecommendations} />
              <ForecastInsightsList insights={result.insights} />
            </>
          )}
        </>
      )}
    </div>
  );
}
