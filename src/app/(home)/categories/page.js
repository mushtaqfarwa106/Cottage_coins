"use client";

import { useState, useEffect, useCallback } from "react";
import { categoriesAPI } from "@/lib/api/categories";
import { CategoriesPageHeader } from "./components/CategoriesPageHeader";
import { CategorySummaryCards } from "./components/CategorySummaryCards";
import { CategoriesGrid } from "./components/CategoriesGrid";
import { CategoryModal } from "./components/CategoryModal";
import { DeleteCategoryDialog } from "./components/DeleteCategoryDialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("#64748b");

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data.categories);
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormColor("#64748b");
    setEditingCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description ?? "");
    setFormColor(category.color ?? "#64748b");
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!formName.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        color: formColor,
      };

      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, payload);
      } else {
        await categoriesAPI.create(payload);
      }
      setIsModalOpen(false);
      resetForm();
      await fetchCategories();
    } catch (err) {
      setError(err.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);
    try {
      await categoriesAPI.delete(deleteCategory._id);
      setDeleteCategory(null);
      await fetchCategories();
    } catch (err) {
      setError(err.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const totalCategories = categories.length;
  const inUseCategories = categories.filter((c) => c.transactionCount > 0).length;

  return (
    <div className="space-y-6">
      <CategoriesPageHeader onAddCategory={openAddModal} />

      <CategorySummaryCards
        totalCategories={totalCategories}
        inUseCategories={inUseCategories}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
          Loading categories...
        </div>
      ) : (
        <CategoriesGrid
          categories={categories}
          onEdit={openEditModal}
          onDelete={setDeleteCategory}
        />
      )}

      <CategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        isEditing={!!editingCategory}
        formName={formName}
        onFormNameChange={setFormName}
        formDescription={formDescription}
        onFormDescriptionChange={setFormDescription}
        formColor={formColor}
        onFormColorChange={setFormColor}
        onSave={handleSaveCategory}
        onCancel={handleModalCancel}
        isSaving={isSaving}
      />

      <DeleteCategoryDialog
        category={deleteCategory}
        open={!!deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
        onConfirm={handleDeleteCategory}
        isDeleting={isDeleting}
      />
    </div>
  );
}
