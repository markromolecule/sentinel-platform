"use client";
 
import { EmptyState } from "@sentinel/ui";
import { AddSemesterDialog } from "../dialogs/add-semester-dialog";
 
interface SemestersEmptyStateProps {
    searchTerm?: string;
}
 
export function SemestersEmptyState({ searchTerm }: SemestersEmptyStateProps) {
    return (
        <EmptyState
            icon="📅"
            title={searchTerm ? "No results found" : "No semesters added"}
            description={
                searchTerm
                    ? `We couldn't find any semesters matching "${searchTerm}".`
                    : "Begin by creating a new academic semester for your institution. This will help organize terms and enrollments."
            }
            action={!searchTerm && <AddSemesterDialog />}
        />
    );
}
