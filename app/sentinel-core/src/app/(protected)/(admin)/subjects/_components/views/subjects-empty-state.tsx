"use client";

import { EmptyState } from "@sentinel/ui";
import { AddSubjectDialog } from "@/app/(protected)/(admin)/subjects/_components/dialogs/add-subject-dialog";

interface SubjectsEmptyStateProps {
    searchTerm?: string;
}

export function SubjectsEmptyState({ searchTerm }: SubjectsEmptyStateProps) {
    return (
        <EmptyState
            icon="📚"
            title={searchTerm ? "No results found" : "No subjects added"}
            description={
                searchTerm
                    ? `We couldn't find any subjects matching "${searchTerm}".`
                    : "Add subjects to the master list to start managing academic offerings."
            }
            action={!searchTerm && <AddSubjectDialog />}
        />
    );
}
