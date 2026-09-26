"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#64748b", // slate (default)
  "#78716c", // stone
];

export function CategoryModal({
  open,
  onOpenChange,
  isEditing,
  formName,
  onFormNameChange,
  formDescription,
  onFormDescriptionChange,
  formColor,
  onFormColorChange,
  onSave,
  onCancel,
  isSaving,
}) {
  const isFormValid = formName.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the category details below."
              : "Fill in the details to create a new category."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={formName}
              onChange={(e) => onFormNameChange(e.target.value)}
              placeholder="e.g. Groceries"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description (optional)</Label>
            <Textarea
              id="cat-desc"
              value={formDescription}
              onChange={(e) => onFormDescriptionChange(e.target.value)}
              placeholder="Add a short description..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onFormColorChange(color)}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform hover:scale-110",
                    formColor === color
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="size-7 rounded-full border border-border flex-shrink-0"
                style={{ backgroundColor: formColor }}
              />
              <Input
                value={formColor}
                onChange={(e) => onFormColorChange(e.target.value)}
                placeholder="#64748b"
                className="font-mono text-sm"
                maxLength={7}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!isFormValid || isSaving}>
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Save Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
