'use client';

import { ExamDialogShell } from '@/features/exams/_components/forms/components';
import { ExamCreateForm } from '@/features/exams/_components/forms/layouts';
import type { ExamCreateDialogProps } from '@sentinel/shared/types';

export function ExamCreateDialog({ open, onOpenChange }: ExamCreateDialogProps) {
    return (
        <ExamDialogShell
            open={open}
            onOpenChange={onOpenChange}
            eyebrow="Exam Setup"
            title="Create New Exam"
            description="Set the exam metadata first, then continue directly to the builder."
        >
            <ExamCreateForm onClose={() => onOpenChange(false)} />
        </ExamDialogShell>
    );
}
