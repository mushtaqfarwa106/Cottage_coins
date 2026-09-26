"use client";

import { FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportsPageHeader({ onExportPdf, onExportCsv, isPdfExporting }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Reports</h1>
        <p className="text-muted-foreground">Analyze your financial performance</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPdf}
          disabled={isPdfExporting}
        >
          <FileText className="size-4" />
          {isPdfExporting ? "Exporting…" : "Export PDF"}
        </Button>
        <Button size="sm" onClick={onExportCsv}>
          <FileDown className="size-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
