"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "../utils";
import { cn } from "@/lib/utils";

export function TransactionsTable({ transactions, onEdit, onDelete }) {
  const amountSign = (tx) => (tx.type === "income" ? "+" : "\u2212");

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No transactions match your filters.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx._id}>
                <TableCell className="font-medium">{tx.name}</TableCell>
                <TableCell>
                  <Badge
                    className="border-0 text-white"
                    style={{ backgroundColor: tx.category?.color ?? "#64748b" }}
                  >
                    {tx.category?.name ?? "\u2014"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(tx.date)}</TableCell>
                <TableCell className="capitalize">{tx.paymentMethod.replace(" ", " ")}</TableCell>
                <TableCell>
                  <Badge
                    variant={tx.type === "income" ? "default" : "destructive"}
                    className={cn(tx.type === "income" && "bg-emerald-600 hover:bg-emerald-600")}
                  >
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium",
                    tx.type === "income" ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {amountSign(tx)}
                  {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => onEdit(tx)} aria-label="Edit">
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(tx)}
                      aria-label="Delete"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
