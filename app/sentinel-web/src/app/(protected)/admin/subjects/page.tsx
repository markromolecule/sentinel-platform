"use client";

import { useSubjectStore } from "@/stores/use-subject-store";
import { SubjectsList } from "@/app/(protected)/admin/subjects/_components/subjects-list";
import { AddSubjectDialog } from "@/app/(protected)/admin/subjects/_components/add-subject-dialog";
import { masterColumns } from "@/app/(protected)/admin/subjects/_components/master-columns";
import { BulkUploadDialog } from "@/app/(protected)/admin/subjects/_components/bulk-upload-dialog";

export default function AdminSubjectsPage() {
    const masterSubjects = useSubjectStore((state) => state.masterSubjects);

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Master Subject Catalog</h1>
                    <p className="text-muted-foreground">
                        Manage the central list of subjects available for enrollment.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <BulkUploadDialog />
                    <AddSubjectDialog />
                </div>
            </div>

            <SubjectsList subjects={masterSubjects} columns={masterColumns} />
        </div>
    );
}
