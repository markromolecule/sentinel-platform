'use client';
import { Badge, Button } from '@sentinel/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ExamAttemptRuntimeFooterProps = {
    progress: number;
    isFlagged: boolean;
    onMove: (direction: 'previous' | 'next') => void;
    currentQuestionIndex: number;
    totalQuestions: number;
    isLastQuestion: boolean;
    onSubmit: () => void;
    isSubmitting?: boolean;
};

export function ExamAttemptRuntimeFooter({
    progress,
    isFlagged,
    onMove,
    currentQuestionIndex,
    totalQuestions,
    isLastQuestion,
    onSubmit,
    isSubmitting,
}: ExamAttemptRuntimeFooterProps) {
    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md px-3 py-1">
                    {progress}% complete
                </Badge>
                {isFlagged ? (
                    <Badge
                        variant="outline"
                        className="rounded-md border-amber-300 bg-amber-50 px-3 py-1 text-amber-700"
                    >
                        Flagged for review
                    </Badge>
                ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onMove('previous')}
                    disabled={totalQuestions === 0 || currentQuestionIndex === 0}
                    className="rounded-md"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
                <div className="border-border/60 bg-muted/20 border px-4 py-2 text-center text-sm font-medium">
                    Question {totalQuestions ? currentQuestionIndex + 1 : 0} of {totalQuestions}
                </div>
                <Button
                    type="button"
                    onClick={isLastQuestion ? onSubmit : () => onMove('next')}
                    disabled={totalQuestions === 0 || isSubmitting}
                    className="rounded-md"
                >
                    {isLastQuestion ? (isSubmitting ? 'Preparing...' : 'Turn In') : 'Next'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
