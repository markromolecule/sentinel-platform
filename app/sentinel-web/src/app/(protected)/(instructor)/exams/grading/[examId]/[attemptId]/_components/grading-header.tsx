'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@sentinel/ui';
import { Award, ArrowLeft, Save } from 'lucide-react';
import type { GradingHeaderProps } from './_types';

/**
 * Renders the top header bar of the grading workspace containing actions
 * and student metadata.
 */
function GradingHeader({
    studentName,
    studentNumber,
    examTitle,
    subjectTitle,
    examId,
    isSubmitting,
    onSubmit,
}: GradingHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Award className="h-4 w-4" />
                    <span>Grading Workspace</span>
                    <span>&bull;</span>
                    <span>{subjectTitle}</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">{studentName}</h1>
                <p className="text-muted-foreground text-sm">
                    Student Number: <span className="font-semibold">{studentNumber}</span> &bull; Exam:{' '}
                    <span className="font-semibold">{examTitle}</span>
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => router.push(`/exams/grading/${examId}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={onSubmit} disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Grades'}
                </Button>
            </div>
        </div>
    );
}

export { GradingHeader };
