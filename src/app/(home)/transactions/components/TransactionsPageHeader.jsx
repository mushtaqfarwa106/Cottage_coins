"use client";

import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TransactionsPageHeader({ onAddTransaction }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Transactions</h1>
        <p className="text-muted-foreground">Manage your income and expenses</p>
      </div>
      <div className="flex gap-2">
        {/* <Button variant="outline" size="sm">
          <Download className="size-4" />
          Export
        </Button> */}
        <Button size="sm" onClick={onAddTransaction}>
          <Plus className="size-4" />
          Add Transaction
        </Button>
      </div>
    </div>
  );
}
