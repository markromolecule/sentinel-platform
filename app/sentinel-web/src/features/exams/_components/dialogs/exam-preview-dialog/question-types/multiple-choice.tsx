'use client';

import { Check } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { BaseQuestionProps } from '../_types';

export function MultipleChoice({
    question,
    selectedAnswer,
    onAnswerChange,
    previewMode,
}: BaseQuestionProps) {
    const options = question.content.options || [];
    const correctAnswer = question.content.correctAnswer;

    return (
        <div className="grid gap-2 sm:gap-3">
            {options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = correctAnswer === i;

                return (
                    <button
                        key={i}
                        onClick={() => onAnswerChange(i)}
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
                                        ? 'rotate-3 border-[#323d8f] bg-[#323d8f] text-white'
                                        : 'border-border text-muted-foreground bg-[#f8fafc] group-hover:rotate-1',
                                )}
                            >
                                <span>{String.fromCharCode(65 + i)}</span>
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
