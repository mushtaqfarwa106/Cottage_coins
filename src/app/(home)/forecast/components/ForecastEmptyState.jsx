import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ForecastEmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-6 text-primary" />
        </div>
        <div className="max-w-md space-y-1">
          <p className="font-medium">Generate your first forecast</p>
          <p className="text-sm text-muted-foreground">
            We&apos;ll analyze your last six months of income and spending, then suggest next
            month&apos;s category expenses, budgets, and insights tailored to you.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
