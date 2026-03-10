"use client";

import { SubjectsList } from "@/app/(protected)/admin/subjects/_components/subjects-list";
import { AddSubjectDialog } from "@/app/(protected)/admin/subjects/_components/add-subject-dialog";
import { masterColumns } from "@/app/(protected)/admin/subjects/_components/master-columns";
import { BulkUploadDialog } from "@/app/(protected)/admin/subjects/_components/bulk-upload-dialog";
import { PageHeader } from "@/components/common";
import { useSubjectsQuery } from "@/hooks/query/subjects/use-subjects-query";

export default function AdminSubjectsPage() {
    const { data: subjects = [], isLoading, isError } = useSubjectsQuery();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader title="Subject Management" description="Manage academic subjects and assign them to courses." />
                <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader title="Subject Management" description="Manage academic subjects and assign them to courses." />
                <div className="flex h-48 items-center justify-center text-destructive">
                    Error loading Subjects. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Subject Management"
                description="Manage the central list of subjects available for enrollment."
            >
                <BulkUploadDialog />
                <AddSubjectDialog />
            </PageHeader>
            <SubjectsList subjects={subjects} columns={masterColumns} />
        </div>
    );
}
