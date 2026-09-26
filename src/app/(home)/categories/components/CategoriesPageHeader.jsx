"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoriesPageHeader({ onAddCategory }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Categories</h1>
        <p className="text-muted-foreground">Manage your transaction categories</p>
      </div>
      <Button size="sm" onClick={onAddCategory}>
        <Plus className="size-4" />
        Add Category
      </Button>
    </div>
  );
}
