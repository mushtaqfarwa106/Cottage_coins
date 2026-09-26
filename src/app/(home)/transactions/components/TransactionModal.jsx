"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function TransactionModal({
  open,
  onOpenChange,
  isEditing,
  formName,
  onFormNameChange,
  formAmount,
  onFormAmountChange,
  formDate,
  onFormDateChange,
  formType,
  onFormTypeChange,
  formPaymentMethod,
  onFormPaymentMethodChange,
  formCategory,
  onFormCategoryChange,
  formDescription,
  onFormDescriptionChange,
  onSave,
  onCancel,
  isSaving,
  categories,
}) {
  const [touched, setTouched] = useState({});

  // Reset touched state when modal opens/closes
  useEffect(() => {
    if (!open) setTouched({});
  }, [open]);

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const errors = {
    name:
      !formName.trim()
        ? "Name is required"
        : formName.trim().length < 2
        ? "Name must be at least 2 characters"
        : null,
    amount:
      formAmount === ""
        ? "Amount is required"
        : isNaN(parseFloat(formAmount))
        ? "Amount must be a number"
        : parseFloat(formAmount) <= 0
        ? "Amount must be greater than 0"
        : parseFloat(formAmount) > 100_000_000
        ? "Amount is too large"
        : null,
    date: !formDate ? "Date is required" : null,
    category: !formCategory ? "Please select a category" : null,
  };

  const isFormValid = Object.values(errors).every((e) => e === null);

  const handleSave = () => {
    // Touch all fields to reveal any hidden errors before submitting
    setTouched({ name: true, amount: true, date: true, category: true });
    if (!isFormValid) return;
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the transaction details below."
              : "Fill in the details to add a new transaction."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="form-name">Name</Label>
            <Input
              id="form-name"
              value={formName}
              onChange={(e) => onFormNameChange(e.target.value)}
              onBlur={() => touch("name")}
              placeholder="e.g. Cumin Seed Sale"
              className={cn(touched.name && errors.name && "border-destructive focus-visible:ring-destructive")}
            />
            {touched.name && errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="form-amount">Amount</Label>
            <Input
              id="form-amount"
              type="number"
              min="0"
              step="0.01"
              value={formAmount}
              onChange={(e) => onFormAmountChange(e.target.value)}
              onBlur={() => touch("amount")}
              placeholder="0.00"
              className={cn(touched.amount && errors.amount && "border-destructive focus-visible:ring-destructive")}
            />
            {touched.amount && errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="form-date">Date</Label>
            <Input
              id="form-date"
              type="date"
              value={formDate}
              onChange={(e) => onFormDateChange(e.target.value)}
              onBlur={() => touch("date")}
              className={cn(touched.date && errors.date && "border-destructive focus-visible:ring-destructive")}
            />
            {touched.date && errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex rounded-md border p-1">
              <button
                type="button"
                onClick={() => onFormTypeChange("income")}
                className={cn(
                  "flex-1 rounded px-3 py-2 text-sm font-medium transition-colors",
                  formType === "income"
                    ? "bg-emerald-600 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => onFormTypeChange("expense")}
                className={cn(
                  "flex-1 rounded px-3 py-2 text-sm font-medium transition-colors",
                  formType === "expense"
                    ? "bg-red-600 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label>Payment Method</Label>
            <Select value={formPaymentMethod} onValueChange={onFormPaymentMethodChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit card">Credit Card</SelectItem>
                <SelectItem value="bank transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={formCategory}
              onValueChange={(val) => {
                onFormCategoryChange(val);
                touch("category");
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  touched.category && errors.category && "border-destructive focus-visible:ring-destructive"
                )}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.category && errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="form-desc">Description (optional)</Label>
            <Textarea
              id="form-desc"
              value={formDescription}
              onChange={(e) => onFormDescriptionChange(e.target.value)}
              placeholder="Add notes..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !isFormValid}>
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Save Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
