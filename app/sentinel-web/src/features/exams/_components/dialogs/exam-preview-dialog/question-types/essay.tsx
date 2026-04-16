'use client';

import { AlignLeft } from 'lucide-react';
import { Textarea, cn } from '@sentinel/ui';
import { BaseQuestionProps } from '../_types';

export function Essay({
    question,
    selectedAnswer,
    onAnswerChange,
    previewMode,
}: BaseQuestionProps) {
    const rubric = question.content.rubric;

    return (
        <div className="space-y-3 sm:space-y-4">
            <Textarea
                placeholder="Write your essay here..."
                value={(selectedAnswer as string) || ''}
                onChange={(e) => onAnswerChange(e.target.value)}
                className={cn(
                    'placeholder:text-muted-foreground/40 resize-none rounded-lg border-none bg-[#323d8f]/5 p-4 text-sm leading-relaxed font-medium focus-visible:ring-1 focus-visible:ring-[#323d8f]/30 sm:rounded-2xl sm:p-6 sm:text-base',
                    previewMode === 'mobile' ? 'min-h-[150px]' : 'min-h-[200px]',
                )}
            />
            <div className="flex justify-end pt-1 sm:pt-2">
                <span className="text-muted-foreground/50 text-[8px] font-black tracking-widest uppercase sm:text-[10px]">
                    Characters: {typeof selectedAnswer === 'string' ? selectedAnswer.length : 0}
                </span>
            </div>
            {rubric && (
                <div className="space-y-2 rounded-lg border border-amber-100 bg-amber-50 p-3 sm:rounded-xl sm:p-4">
                    <div className="flex shrink-0 items-center gap-2 text-amber-800">
                        <AlignLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        <span className="text-[8px] font-black tracking-widest uppercase sm:text-[10px]">
                            Grading Rubric
                        </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-700/80 italic sm:text-xs">
                        {rubric}
                    </p>
                </div>
            )}
        </div>
    );
}
