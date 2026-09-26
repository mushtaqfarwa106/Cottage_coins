"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ReportPeriodSelector({
  period,
  onPeriodChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearCustomRange,
}) {
  const from = String(dateFrom).trim();
  const to = String(dateTo).trim();
  const hasCustom = Boolean(from && to);
  const incompleteCustom = (from || to) && !hasCustom;

  const handleFromChange = (e) => {
    const value = e.target.value;
    onDateFromChange(value);
    if (value && to && to < value) {
      onDateToChange(value);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium mb-2">Period</p>
            <Tabs value={period} onValueChange={onPeriodChange}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="weekly" className="flex-1 sm:flex-none">
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex-1 sm:flex-none">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="yearly" className="flex-1 sm:flex-none">
                  Yearly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-date-from" className="text-xs text-muted-foreground">
                Custom from
              </Label>
              <Input
                id="report-date-from"
                type="date"
                value={dateFrom}
                onChange={handleFromChange}
                className="w-full sm:w-[160px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-date-to" className="text-xs text-muted-foreground">
                Custom to
              </Label>
              <Input
                id="report-date-to"
                type="date"
                value={dateTo}
                min={from || undefined}
                onChange={(e) => onDateToChange(e.target.value)}
                className="w-full sm:w-[160px]"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button type="button" variant="ghost" size="sm" onClick={onClearCustomRange}>
                Clear custom range
              </Button>
            )}
          </div>
        </div>
        {incompleteCustom && (
          <p className="text-xs text-muted-foreground">
            Select both start and end dates to load the report for a custom range.
          </p>
        )}
        {hasCustom && (
          <p className="text-xs text-muted-foreground">
            Custom date range is active and overrides the period preset for the report window.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
