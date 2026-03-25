"use client";

import { Card } from "@sentinel/ui";
import { ExamCardProps } from "@sentinel/shared/types";
import { useExamCard } from "@/features/exams/_hooks/use-exam-card";

import { ExamCardHeader } from "@/features/exams/_components/exam-list/exam-card/exam-card-header";
import { ExamCardBody } from "@/features/exams/_components/exam-list/exam-card/exam-card-body";
import { ExamCardFooter } from "@/features/exams/_components/exam-list/exam-card/exam-card-footer";
import { ExamCardDeleteAlert } from "@/features/exams/_components/exam-list/exam-card/exam-card-delete-alert";
import { ExamPreviewDialog } from "@/features/exams/_components/exam-list/exam-card/exam-preview-dialog";

export function ExamCard({ exam }: ExamCardProps) {
    const {
        showDeleteAlert,
        setShowDeleteAlert,
        showPreview,
        setShowPreview,
        handleDelete,
        primaryActions,
        statusClass,
    } = useExamCard({ exam });

    return (
        <>
            <Card className="shadow-none border-border/60 bg-background">
                <ExamCardHeader
                    exam={exam}
                    statusClass={statusClass}
                    onDeleteClick={() => setShowDeleteAlert(true)}
                    onPreviewClick={() => setShowPreview(true)}
                />
                <ExamCardBody exam={exam} />
                <ExamCardFooter primaryActions={primaryActions} />
            </Card>

            <ExamCardDeleteAlert
                open={showDeleteAlert}
                onOpenChange={setShowDeleteAlert}
                title={exam.title}
                onDelete={handleDelete}
            />

            <ExamPreviewDialog
                open={showPreview}
                onOpenChange={setShowPreview}
                exam={exam}
            />
        </>
    );
}
