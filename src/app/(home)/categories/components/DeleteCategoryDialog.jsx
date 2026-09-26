"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}) {
  const isInUse = category?.transactionCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isInUse ? "Cannot Delete Category" : "Delete Category"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isInUse ? (
              <>
                <span className="font-medium text-foreground">
                  &quot;{category?.name}&quot;
                </span>{" "}
                is linked to{" "}
                <span className="font-medium text-foreground">
                  {category?.transactionCount} transaction
                  {category?.transactionCount === 1 ? "" : "s"}
                </span>
                . Remove or reassign those transactions before deleting this
                category.
              </>
            ) : (
              <>
                Are you sure you want to delete &quot;
                <span className="font-medium text-foreground">
                  {category?.name}
                </span>
                &quot;? This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {isInUse ? "Close" : "Cancel"}
          </AlertDialogCancel>
          {!isInUse && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
