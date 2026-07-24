'use client';
import { Flag } from 'lucide-react';
import { cn } from '@sentinel/ui';
import type { ExamQuestion } from '@sentinel/shared/types';

type ExamAttemptRuntimeNavigationProps = {
    questions: ExamQuestion[];
    currentQuestionIndex: number;
    onQuestionSelect: (index: number) => void;
    answeredQuestionIds: string[];
    reviewQuestionIds: string[];
};

export function ExamAttemptRuntimeNavigation({
    questions,
    currentQuestionIndex,
    onQuestionSelect,
    answeredQuestionIds,
    reviewQuestionIds,
}: ExamAttemptRuntimeNavigationProps) {
    const reviewSet = new Set(reviewQuestionIds);

    return (
        <>
            {questions.map((question, index) => {
                const isActive = currentQuestionIndex === index;
                const isAnswered = answeredQuestionIds.includes(question.id);
                const isFlagged = reviewSet.has(question.id);

                return (
                    <button
                        key={question.id}
                        type="button"
                        onClick={() => onQuestionSelect(index)}
                        className={cn(
                            'relative flex h-12 w-12 shrink-0 items-center justify-center border-l-2 px-2 text-sm font-semibold transition sm:h-14 sm:w-14 sm:px-3 lg:h-12 lg:w-full',
                            isActive
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'text-muted-foreground hover:border-border hover:bg-muted/20 hover:text-foreground border-transparent bg-transparent',
                        )}
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`Question ${index + 1}`}
                    >
                        {index + 1}
                        {isAnswered ? (
                            <span className="pointer-events-none absolute top-2 right-2 h-2.5 w-2.5 bg-emerald-500" />
                        ) : null}
                        {isFlagged ? (
                            <Flag className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 text-amber-600" />
                        ) : null}
                    </button>
                );
            })}
        </>
    );
}
