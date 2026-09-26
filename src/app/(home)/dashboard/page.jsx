"use client";

import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api/dashboard";
import { authAPI } from "@/lib/api/auth";
import { DashboardWelcomeBanner } from "./components/DashboardWelcomeBanner";
import { DashboardSummaryCards } from "./components/DashboardSummaryCards";
import { DashboardMonthlyTrendChart } from "./components/DashboardMonthlyTrendChart";
import { DashboardRecentTransactions } from "./components/DashboardRecentTransactions";
import { DashboardTopCategoriesDonut } from "./components/DashboardTopCategoriesDonut";
import { DashboardQuickActions } from "./components/DashboardQuickActions";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

const emptyDashboard = {
  totalIncome: 0,
  totalExpenses: 0,
  netBalance: 0,
  transactionCount: 0,
  recentTransactions: [],
  monthlyTrend: [],
  topCategories: [],
};

export default function DashboardPage() {
  const [data, setData] = useState(emptyDashboard);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [dash, user] = await Promise.all([
          dashboardAPI.getDashboard(),
          authAPI.getCurrentUser(),
        ]);
        if (cancelled) return;
        setData({
          totalIncome: dash.totalIncome ?? 0,
          totalExpenses: dash.totalExpenses ?? 0,
          netBalance: dash.netBalance ?? 0,
          transactionCount: dash.transactionCount ?? 0,
          recentTransactions: dash.recentTransactions ?? [],
          monthlyTrend: dash.monthlyTrend ?? [],
          topCategories: dash.topCategories ?? [],
        });
        setUserName(user?.name ?? "");
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load dashboard");
          setData(emptyDashboard);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardWelcomeBanner userName={userName} />
          <DashboardSummaryCards
            totalIncome={data.totalIncome}
            totalExpenses={data.totalExpenses}
            netBalance={data.netBalance}
            transactionCount={data.transactionCount}
          />
          <DashboardMonthlyTrendChart monthlyTrend={data.monthlyTrend} />
          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardRecentTransactions transactions={data.recentTransactions} />
            <DashboardTopCategoriesDonut topCategories={data.topCategories} />
          </div>
          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <img
              src="/banner.jpg"
              alt="Cottage Coins"
              className="w-full h-48 object-cover object-center"
            />
          </div>
          <DashboardQuickActions />
        </>
      )}
    </div>
  );
}
