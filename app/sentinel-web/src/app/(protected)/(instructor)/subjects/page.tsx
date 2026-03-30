"use client";

import { useDebounce } from "@sentinel/hooks";
import { useState } from "react";
import { useSubjectsList } from "@/app/(protected)/(instructor)/subjects/_hooks/use-subjects-list";
import { SubjectsList } from "@/app/(protected)/(instructor)/subjects/_components/views/subjects-list";
import { AddSubjectDialog } from "@/app/(protected)/(instructor)/subjects/_components/dialogs/add-subject-dialog";
import { SubjectsEmptyState } from "@/app/(protected)/(instructor)/subjects/_components/views/subjects-empty-state";
import { PageHeader, Separator } from "@sentinel/ui";

export default function SubjectsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { subjects, isLoading, isError } = useSubjectsList(debouncedSearch);

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Subject Management"
                description="Manage the subjects you are teaching or proctoring."
            >
                <AddSubjectDialog />
            </PageHeader>

            <Separator />

            <div className="relative">
                {subjects.length > 0 || searchTerm !== "" ? (
                    <SubjectsList
                        subjects={subjects}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                ) : !isLoading && subjects.length === 0 ? (
                    <SubjectsEmptyState />
                ) : null}

                {/* Subtle loading overlay only for initial empty state */}
                {isLoading && subjects.length === 0 && (
                    <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center bg-background/80 z-10 rounded-md">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                )}

                {isError && (
                    <div className="mt-4 flex h-32 items-center justify-center text-destructive bg-destructive/5 rounded-md border border-destructive/20">
                        Error loading subjects. Please try again.
                    </div>
                )}
            </div>
        </div>
    );
}
