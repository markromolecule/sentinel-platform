"use client";

import { Settings, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@sentinel/ui";
import Link from "next/link";
import { Separator } from "@sentinel/ui";
import { ExamCreateDialog, ExamsTable, ExamEmptyState } from "./_components";
import { useProctorExams } from "./_hooks/use-proctor-exams";

export default function ProctorExamsPage() {
    const { exams, isCreateOpen, setIsCreateOpen } = useProctorExams();

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Exams"
                description="Manage your examinations and assessments."
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/proctor/exams/configuration">
                            <Settings className="w-4 h-4 mr-2" />
                            Configuration
                        </Link>
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Exam
                    </Button>
                    {isCreateOpen && (
                        <ExamCreateDialog
                            open={isCreateOpen}
                            onOpenChange={setIsCreateOpen}
                        />
                    )}
                </div>
            </PageHeader>

            <Separator />

            <div className="flex flex-col gap-4">
                {exams.length > 0 ? (
                    <ExamsTable exams={exams} />
                ) : (
                    <ExamEmptyState
                        isSearching={false}
                        onCreateClick={() => setIsCreateOpen(true)}
                    />
                )}
            </div>
        </div>
    );
}
