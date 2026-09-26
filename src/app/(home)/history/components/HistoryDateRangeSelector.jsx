import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HistoryDateRangeSelector({
  draftFrom,
  draftTo,
  onDraftFromChange,
  onDraftToChange,
  onApply,
  isApplying,
}) {
  const from = String(draftFrom || "").trim();
  const to = String(draftTo || "").trim();
  const canApply = Boolean(from && to) && from <= to;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="history-date-from">From</Label>
            <Input
              id="history-date-from"
              type="date"
              value={draftFrom}
              onChange={(e) => onDraftFromChange(e.target.value)}
              className="w-full md:w-[180px]"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="history-date-to">To</Label>
            <Input
              id="history-date-to"
              type="date"
              value={draftTo}
              min={from || undefined}
              onChange={(e) => onDraftToChange(e.target.value)}
              className="w-full md:w-[180px]"
            />
          </div>
          <Button type="button" onClick={onApply} disabled={!canApply || isApplying} className="md:ml-1">
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
