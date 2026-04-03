"use client";

import { Button, EmptyState } from "@sentinel/ui";
import { Plus } from "lucide-react";
import { ExamEmptyStateProps } from '@sentinel/shared/types';;

export function ExamEmptyState({ isSearching, onCreateClick }: ExamEmptyStateProps) {
    return (
        <EmptyState
            icon="📝"
            title={isSearching ? "No exams found" : "No exams yet"}
            description={
                isSearching
                    ? "No results found. Try a different search term."
                    : "You haven't created any exams yet. Use the button below to create your first draft."
            }
            action={
                !isSearching ? (
                    <Button
                        onClick={onCreateClick}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Exam
                    </Button>
                ) : undefined
            }
            className="animate-in fade-in-50"
        />
    );
}
