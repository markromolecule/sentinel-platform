"use client";

import { EmptyState } from "@sentinel/ui";
import { AddSubjectDialog } from "@/app/(protected)/(admin)/subjects/_components/dialogs/add-subject-dialog";

interface SubjectsEmptyStateProps {
    searchTerm?: string;
    canManageCatalog?: boolean;
}

export function SubjectsEmptyState({
    searchTerm,
    canManageCatalog = true,
}: SubjectsEmptyStateProps) {
    return (
        <EmptyState
            icon="📚"
            title={searchTerm ? "No results found" : "No subjects added"}
            description={
                searchTerm
                    ? `We couldn't find any subjects matching "${searchTerm}".`
                    : canManageCatalog
                      ? "Add subjects to the master list to start managing academic offerings."
                      : "No subjects are available in the shared catalog yet."
            }
            action={!searchTerm && canManageCatalog ? <AddSubjectDialog /> : null}
        />
    );
}
