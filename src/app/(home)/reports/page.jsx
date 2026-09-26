"use client";

import { useState, useEffect, useMemo } from "react";
import { reportsAPI } from "@/lib/api/reports";
import { ReportsPageHeader } from "./components/ReportsPageHeader";
import { ReportPeriodSelector } from "./components/ReportPeriodSelector";
import { ReportSummaryCards } from "./components/ReportSummaryCards";
import { ReportTrendChart } from "./components/ReportTrendChart";
import { ReportCategorySection } from "./components/ReportCategorySection";
import { ReportSkeleton } from "./components/ReportSkeleton";
import { downloadReportCsv, downloadReportPdf } from "./utils/export-report";

const emptyReport = {
  totalIncome: 0,
  totalExpenses: 0,
  netBalance: 0,
  monthlyTrend: [],
  categoryBreakdown: [],
  transactionCount: 0,
};

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [report, setReport] = useState(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  const { periodLabel, pdfPeriodLabel } = useMemo(() => {
    const from = String(dateFrom).trim();
    const to = String(dateTo).trim();
    const preset = `${period.charAt(0).toUpperCase() + period.slice(1)} view`;
    if (from && to) {
      return {
        periodLabel: `Custom range: ${from} → ${to}`,
        pdfPeriodLabel: `${from} to ${to}`,
      };
    }
    return { periodLabel: preset, pdfPeriodLabel: preset };
  }, [period, dateFrom, dateTo]);

  useEffect(() => {
    const from = String(dateFrom).trim();
    const to = String(dateTo).trim();
    const incompleteCustom = (from || to) && !(from && to);
    if (incompleteCustom) {
      setLoading(false);
      setError(null);
      setReport(emptyReport);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { period };
        if (from && to) {
          params.dateFrom = from;
          params.dateTo = to;
        }
        const data = await reportsAPI.getReport(params);
        if (cancelled) return;
        setReport({
          totalIncome: data.totalIncome ?? 0,
          totalExpenses: data.totalExpenses ?? 0,
          netBalance: data.netBalance ?? 0,
          monthlyTrend: data.monthlyTrend ?? [],
          categoryBreakdown: data.categoryBreakdown ?? [],
          transactionCount: data.transactionCount ?? 0,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load report");
        setReport(emptyReport);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [period, dateFrom, dateTo]);

  const handleExportCsv = () => {
    downloadReportCsv(report);
  };

  const handleExportPdf = () => {
    setIsPdfExporting(true);
    try {
      downloadReportPdf(report, pdfPeriodLabel);
    } catch (e) {
      setError(e?.message || "Failed to export PDF");
    } finally {
      setIsPdfExporting(false);
    }
  };

  const clearCustomRange = () => {
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-6">
      <ReportsPageHeader
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        isPdfExporting={isPdfExporting}
      />

      <ReportPeriodSelector
        period={period}
        onPeriodChange={setPeriod}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClearCustomRange={clearCustomRange}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <ReportSkeleton />
      ) : (
        <div className="space-y-6 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold tracking-tight">Financial summary</h2>
            <p className="text-sm text-muted-foreground">{periodLabel}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {report.transactionCount}{" "}
              {report.transactionCount === 1 ? "transaction" : "transactions"} in this period
            </p>
          </div>

          <ReportSummaryCards
            totalIncome={report.totalIncome}
            totalExpenses={report.totalExpenses}
            netBalance={report.netBalance}
          />

          <ReportTrendChart monthlyTrend={report.monthlyTrend} />

          <ReportCategorySection categoryBreakdown={report.categoryBreakdown} />
        </div>
      )}
    </div>
  );
}
