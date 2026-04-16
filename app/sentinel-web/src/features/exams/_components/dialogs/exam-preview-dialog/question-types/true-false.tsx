'use client';

import { Check } from 'lucide-react';
import { Button, cn } from '@sentinel/ui';
import { BaseQuestionProps } from '../_types';

export function TrueFalse({
    question,
    selectedAnswer,
    onAnswerChange,
    previewMode,
}: BaseQuestionProps) {
    const correctBoolean = question.content.correctBoolean;

    return (
        <div
            className={cn(
                'flex gap-2 sm:gap-4',
                previewMode === 'mobile' ? 'flex-col' : 'flex-row',
            )}
        >
            {[true, false].map((val) => (
                <Button
                    key={val.toString()}
                    variant={selectedAnswer === val ? 'default' : 'outline'}
                    className={cn(
                        'h-11 flex-1 rounded-lg border-2 text-xs font-black tracking-widest uppercase transition-all sm:h-14 sm:rounded-xl sm:text-sm',
                        selectedAnswer === val
                            ? 'border-[#323d8f] bg-[#323d8f] text-white shadow-md'
                            : 'border-border/60 bg-white hover:bg-[#323d8f]/5',
                    )}
                    onClick={() => onAnswerChange(val)}
                >
                    {val ? 'True' : 'False'}
                    {correctBoolean === val && (
                        <div
                            className="ml-2 shrink-0 rounded-full bg-emerald-400 p-0.5 text-white shadow-sm"
                            title="Correct Answer"
                        >
                            <Check className="h-3 w-3 stroke-[4]" />
                        </div>
                    )}
                </Button>
            ))}
        </div>
    );
}
