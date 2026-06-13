'use client';

import { ExamDialogShell } from '@/features/exams/_components/forms/components';
import { ExamEditForm } from '@/features/exams/_components/forms/layouts';
import type { ProctorExam } from '@sentinel/shared/types';

interface ExamEditDialogProps {
    exam: ProctorExam;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExamEditDialog({ exam, open, onOpenChange }: ExamEditDialogProps) {
    return (
        <ExamDialogShell
            open={open}
            onOpenChange={onOpenChange}
            eyebrow="Exam Metadata"
            title="Edit Exam"
            description="Update the classroom, schedule, room, and other metadata without changing the question builder."
        >
            <ExamEditForm exam={exam} onClose={() => onOpenChange(false)} />
        </ExamDialogShell>
    );
}
