"use client";

import { useSubjectsList } from "./_hooks/use-subjects-list";
import { PageHeader } from "@/components/common/page-header";
import { SubjectsTable } from "./_components/subjects-table";
import { AddSubjectDialog } from "./_components/add-subject-dialog";
import { SubjectsEmptyState } from "./_components/subjects-empty-state";
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

