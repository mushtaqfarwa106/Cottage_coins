"use client";

import { Tag, CheckCircle, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CategorySummaryCards({ totalCategories, inUseCategories }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="bg-linear-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30 border-violet-200/80 dark:border-violet-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
          <div className="rounded-lg bg-violet-100 dark:bg-violet-900/50 p-1.5">
            <LayoutGrid className="size-4 text-violet-600 dark:text-violet-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">{totalCategories}</p>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border-emerald-200/80 dark:border-emerald-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Use</CardTitle>
          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/50 p-1.5">
            <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{inUseCategories}</p>
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-200/80 dark:border-blue-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Unused</CardTitle>
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/50 p-1.5">
            <Tag className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {totalCategories - inUseCategories}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
