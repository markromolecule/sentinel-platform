"use client";

import { SubjectsList } from "@/app/(protected)/admin/subjects/_components/subjects-list";
import { AddSubjectDialog } from "@/app/(protected)/admin/subjects/_components/add-subject-dialog";
import { masterColumns } from "@/app/(protected)/admin/subjects/_components/master-columns";
import { BulkUploadDialog } from "@/app/(protected)/admin/subjects/_components/bulk-upload-dialog";
import { PageHeader } from "@/components/common";
import { useSubjectsQuery } from "@/hooks/query/subjects/use-subjects-query";

export default function AdminSubjectsPage() {
    const { data: subjects = [], isLoading, isError, error } = useSubjectsQuery();

    if (isLoading) {
        return <div className="p-8">Loading subjects...</div>;
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

            {isError && (
                <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
                    Failed to load subjects from database: {error?.message}
                </div>
            )}

            <SubjectsList subjects={subjects} columns={masterColumns} />
        </div>
    );
}
