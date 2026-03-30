"use client";

import { useDebounce, useSubjectsQuery } from "@sentinel/hooks";
import { useState } from "react";
import { SubjectsList } from "@/app/(protected)/(admin)/subjects/_components/subjects-list";
import { AddSubjectDialog } from "@/app/(protected)/(admin)/subjects/_components/add-subject-dialog";
import { masterColumns } from "@/app/(protected)/(admin)/subjects/_components/master-columns";
import { BulkUploadDialog } from "@/app/(protected)/(admin)/subjects/_components/bulk-upload-dialog";
import { PageHeader, Separator } from "@sentinel/ui";

export default function AdminSubjectsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: subjects = [], isLoading, isError } = useSubjectsQuery(debouncedSearch);


    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Subject Management"
                description="Manage the central list of subjects available for enrollment."
            >
                <BulkUploadDialog />
                <AddSubjectDialog />
            </PageHeader>
            <Separator />

            <div className="relative">
                {/* Always render SubjectsList to keep search bar mounted and focused */}
                <SubjectsList
                    subjects={subjects}
                    columns={masterColumns}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

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
