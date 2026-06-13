'use client';

import { ExamDialogShell } from '@/features/exams/_components/forms/components';
import { ExamCreateForm } from '@/features/exams/_components/forms/layouts';
import type { ExamCreateDialogProps } from '@sentinel/shared/types';

export function ExamCreateDialog({ open, onOpenChange }: ExamCreateDialogProps) {
    return (
        <ExamDialogShell
            open={open}
            onOpenChange={onOpenChange}
            eyebrow=""
            title="Create Exam"
            description="Provide exam details below to continue."
        >
            <ExamCreateForm onClose={() => onOpenChange(false)} />
        </ExamDialogShell>
    );
}
