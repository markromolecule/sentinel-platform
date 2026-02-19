"use client";

import { useSubjectStore } from "@/stores/use-subject-store";
import { SubjectsList } from "@/app/(protected)/admin/subjects/_components/subjects-list";
import { AddSubjectDialog } from "@/app/(protected)/admin/subjects/_components/add-subject-dialog";
import { masterColumns } from "@/app/(protected)/admin/subjects/_components/master-columns";
import { BulkUploadDialog } from "@/app/(protected)/admin/subjects/_components/bulk-upload-dialog";
import { PageHeader } from "@/components/common";

export default function AdminSubjectsPage() {
    const masterSubjects = useSubjectStore((state) => state.masterSubjects);

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Master Subject Catalog"
                description="Manage the central list of subjects available for enrollment."
            >
                <BulkUploadDialog />
                <AddSubjectDialog />
            </PageHeader>

            <SubjectsList subjects={masterSubjects} columns={masterColumns} />
        </div>
    );
}

