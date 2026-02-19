"use client";

import { Plus, Settings } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ExamCreateDialog } from "@/app/(protected)/proctor/exams/_components/exam-create-dialog";
import { ExamsTable } from "@/app/(protected)/proctor/exams/_components/exams-table";
import { ExamEmptyState } from "@/app/(protected)/proctor/exams/_components/exam-empty-state";
import { useProctorExams } from "@/app/(protected)/proctor/exams/_hooks/use-proctor-exams";

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
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Exam
                    </Button>
                </div>
            </PageHeader>

            <Separator />

            <div className="flex flex-col gap-4">
                {/* Exam Table */}
                {exams.length > 0 ? (
                    <ExamsTable exams={exams} />
                ) : (
                    /* Empty State */
                    <ExamEmptyState
                        isSearching={false}
                        onCreateClick={() => setIsCreateOpen(true)}
                    />
                )}
            </div>

            {/* Create Exam Dialog */}
            <ExamCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
    );
}

