"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CategoriesGrid({ categories, onEdit, onDelete }) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <div className="mb-3 rounded-full bg-muted p-4">
          <svg
            className="size-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>
        <p className="font-medium text-foreground">No categories yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first category to start organizing transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Card key={category._id} className="group relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: category.color }}
          />
          <CardContent className="pl-5 pr-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="size-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate leading-tight">{category.name}</p>
                  {category.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(category)}
                  className="size-6"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(category)}
                  className="size-6 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <Badge
                variant={category.transactionCount > 0 ? "secondary" : "outline"}
                className="text-xs"
              >
                {category.transactionCount}{" "}
                {category.transactionCount === 1 ? "transaction" : "transactions"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
