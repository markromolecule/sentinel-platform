'use client';

import { Check } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { BaseQuestionProps } from '../_types';

export function MultipleResponse({
    question,
    selectedAnswer,
    onAnswerChange,
    previewMode,
}: BaseQuestionProps) {
    const options = question.content.options || [];
    const correctAnswers = (question.content.correctAnswer as (string | number)[]) || [];
    const selected = (selectedAnswer as (string | number)[]) || [];

    const handleToggle = (i: number) => {
        const next = selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i];
        onAnswerChange(next);
    };

    return (
        <div className="grid gap-2 sm:gap-3">
            {options.map((option, i) => {
                const isSelected = selected.includes(i);
                const isCorrect = correctAnswers.includes(i);

                return (
                    <button
                        key={i}
                        onClick={() => handleToggle(i)}
                        className={cn(
                            'group relative flex items-center justify-between rounded-lg border-2 p-3 text-left transition-all duration-200 sm:rounded-xl sm:p-4',
                            isSelected
                                ? 'border-[#323d8f] bg-[#323d8f]/5 shadow-md'
                                : 'border-border/60 bg-white hover:border-[#323d8f]/40 hover:bg-[#323d8f]/5 hover:shadow-sm',
                        )}
                    >
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                            <div
                                className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black transition-all sm:h-9 sm:w-9 sm:text-sm',
                                    isSelected
                                        ? 'border-[#323d8f] bg-[#323d8f] text-white'
                                        : 'border-border text-muted-foreground bg-[#f8fafc]',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-3.5 w-3.5 items-center justify-center rounded border-2 transition-colors sm:h-4 sm:w-4',
                                        isSelected
                                            ? 'border-white bg-white'
                                            : 'border-muted-foreground/30',
                                    )}
                                >
                                    {isSelected && (
                                        <Check className="h-2.5 w-2.5 stroke-[3] text-[#323d8f] sm:h-3 sm:w-3 sm:stroke-[4]" />
                                    )}
                                </div>
                            </div>
                            <span
                                className={cn(
                                    'text-xs font-bold break-words transition-colors sm:text-sm',
                                    isSelected ? 'text-[#323d8f]' : 'text-muted-foreground',
                                )}
                            >
                                {option}
                            </span>
                        </div>

                        {isCorrect && (
                            <div
                                className="animate-in zoom-in absolute -top-2.5 -right-2.5 z-10 shrink-0 rounded-full border-2 border-white bg-emerald-500 p-1 text-white shadow-lg duration-300"
                                title="Correct Answer (Instructor Insight)"
                            >
                                <Check className="h-3 w-3 stroke-[4]" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
