"use client";

import { useState, useEffect, useCallback } from "react";
import { transactionsAPI } from "@/lib/api/transactions";
import { categoriesAPI } from "@/lib/api/categories";
import { TransactionsPageHeader } from "./components/TransactionsPageHeader";
import { SummaryCards } from "./components/SummaryCards";
import { TransactionFilters } from "./components/TransactionFilters";
import { TransactionsTable } from "./components/TransactionsTable";
import { TransactionModal } from "./components/TransactionModal";
import { DeleteTransactionDialog } from "./components/DeleteTransactionDialog";
import { Card } from "@/components/ui/card";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTransaction, setDeleteTransaction] = useState(null);

  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState("expense");
  const [formPaymentMethod, setFormPaymentMethod] = useState("cash");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== "all") params.type = typeFilter;
      if (paymentFilter !== "all") params.payment = paymentFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await transactionsAPI.getAll(params);
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, paymentFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setPaymentFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const resetForm = () => {
    setFormName("");
    setFormAmount("");
    setFormDate("");
    setFormType("expense");
    setFormPaymentMethod("cash");
    setFormCategory("");
    setFormDescription("");
    setEditingTransaction(null);
  };

  const openAddModal = () => {
    resetForm();
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormCategory(categories[0]?._id ?? "");
    setIsModalOpen(true);
  };

  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setFormName(tx.name);
    setFormAmount(String(tx.amount));
    setFormDate(tx.date?.split?.("T")?.[0] ?? tx.date);
    setFormType(tx.type);
    setFormPaymentMethod(tx.paymentMethod);
    setFormCategory(tx.category?._id ?? "");
    setFormDescription(tx.description ?? "");
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async () => {
    if (!formName.trim() || !formAmount || !formDate || !formCategory) return;
    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount < 0) return;

    setIsSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        amount,
        date: formDate,
        type: formType,
        paymentMethod: formPaymentMethod,
        category: formCategory,
        description: formDescription.trim(),
      };

      if (editingTransaction) {
        await transactionsAPI.update(editingTransaction._id, payload);
      } else {
        await transactionsAPI.create(payload);
      }
      setIsModalOpen(false);
      resetForm();
      await fetchTransactions();
    } catch (err) {
      setError(err.message || "Failed to save transaction");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransaction) return;
    setIsDeleting(true);
    try {
      await transactionsAPI.delete(deleteTransaction._id);
      setDeleteTransaction(null);
      await fetchTransactions();
    } catch (err) {
      setError(err.message || "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const totalCount = transactions.length;

  return (
    <div className="space-y-6">
      <TransactionsPageHeader onAddTransaction={openAddModal} />

      <SummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netBalance={netBalance}
        totalCount={totalCount}
      />

      <TransactionFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onReset={resetFilters}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            Loading transactions...
          </div>
        ) : (
          <TransactionsTable
            transactions={transactions}
            onEdit={openEditModal}
            onDelete={setDeleteTransaction}
          />
        )}
      </Card>

      <TransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        isEditing={!!editingTransaction}
        formName={formName}
        onFormNameChange={setFormName}
        formAmount={formAmount}
        onFormAmountChange={setFormAmount}
        formDate={formDate}
        onFormDateChange={setFormDate}
        formType={formType}
        onFormTypeChange={setFormType}
        formPaymentMethod={formPaymentMethod}
        onFormPaymentMethodChange={setFormPaymentMethod}
        formCategory={formCategory}
        onFormCategoryChange={setFormCategory}
        formDescription={formDescription}
        onFormDescriptionChange={setFormDescription}
        onSave={handleSaveTransaction}
        onCancel={handleModalCancel}
        isSaving={isSaving}
        categories={categories}
      />

      <DeleteTransactionDialog
        transaction={deleteTransaction}
        open={!!deleteTransaction}
        onOpenChange={(open) => !open && setDeleteTransaction(null)}
        onConfirm={handleDeleteTransaction}
        isDeleting={isDeleting}
      />
    </div>
  );
}
