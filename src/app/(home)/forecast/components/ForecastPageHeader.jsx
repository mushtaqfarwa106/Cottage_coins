import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ForecastPageHeader({
  onGenerate,
  isGenerating,
  hasResult,
  cacheLoading = false,
}) {
  const label = isGenerating ? "Generating…" : hasResult ? "Regenerate" : "Generate Forecast";
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">AI Forecast</h1>
          <Badge variant="secondary" className="gap-1 font-normal">
            <Sparkles className="size-3.5" />
            Insights
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Spending outlook, budget ideas, and highlights from your recent activity.
        </p>
      </div>
      <Button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || cacheLoading}
        className="shrink-0"
      >
        {label}
      </Button>
    </div>
  );
}
