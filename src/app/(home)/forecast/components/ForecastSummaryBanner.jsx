import { Skeleton } from "@/components/ui/skeleton";

export function ForecastSummaryBanner({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-cyan-500/10 p-6 shadow-sm">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-4 w-full max-w-3xl" />
        <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-violet-500/15 via-blue-500/12 to-emerald-500/10 p-6 shadow-sm dark:from-violet-950/40 dark:via-blue-950/30 dark:to-emerald-950/20">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Financial health summary
      </p>
      <p className="mt-2 text-base leading-relaxed text-foreground sm:text-lg">{summary}</p>
    </div>
  );
}
