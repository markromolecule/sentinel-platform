'use client';

import { Check } from 'lucide-react';
import { Input } from '@sentinel/ui';
import { BaseQuestionProps } from '../_types';

export function Identification({
    question,
    selectedAnswer,
    onAnswerChange,
    previewMode,
}: BaseQuestionProps) {
    const correctAnswer =
        (question.content.correctAnswer as string) || question.content.acceptedAnswers?.[0];

    return (
        <div className="space-y-3 sm:space-y-4">
            <div>
                <Input
                    placeholder="Type your answer here..."
                    value={(selectedAnswer as string) || ''}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    className="placeholder:text-muted-foreground/40 h-11 rounded-lg border-none bg-[#323d8f]/5 px-4 text-sm font-bold placeholder:font-medium focus-visible:ring-1 focus-visible:ring-[#323d8f]/30 sm:h-14 sm:rounded-2xl sm:px-6 sm:text-lg"
                />
            </div>
            <div className="animate-in slide-in-from-bottom-2 flex flex-col justify-between gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 sm:flex-row sm:items-center sm:gap-3 sm:rounded-xl sm:p-4">
                <div className="flex shrink-0 items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 sm:h-6 sm:w-6">
                        <Check className="h-3 w-3 stroke-[3] text-white sm:h-3.5 sm:w-3.5 sm:stroke-[3]" />
                    </div>
                    <span className="text-[8px] font-black tracking-widest text-emerald-800 uppercase sm:text-[10px]">
                        Correct Answer
                    </span>
                </div>
                <span className="text-xs font-bold break-all text-emerald-700 sm:text-sm">
                    {correctAnswer}
                </span>
            </div>
        </div>
    );
}
