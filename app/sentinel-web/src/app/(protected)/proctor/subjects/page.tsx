"use client";

import { useSubjectsList } from "@/app/(protected)/proctor/subjects/_hooks/use-subjects-list";
import { SubjectsTable } from "@/app/(protected)/proctor/subjects/_components/subjects-table";
import { AddSubjectDialog } from "@/app/(protected)/proctor/subjects/_components/add-subject-dialog";
import { SubjectsEmptyState } from "@/app/(protected)/proctor/subjects/_components/subjects-empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Separator } from "@/components/ui/separator";

export default function SubjectsPage() {
    const { subjects } = useSubjectsList();

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Subject Management"
                description="Manage the subjects you are teaching or proctoring."
            >
                <AddSubjectDialog />
            </PageHeader>

            <Separator />

            {subjects.length > 0 ? (
                <SubjectsTable subjects={subjects} />
            ) : (
                <SubjectsEmptyState />
            )}
        </div>
    );
}

