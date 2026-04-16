'use client';

import { ListChecks, Check } from 'lucide-react';
import { Button, Input, cn } from '@sentinel/ui';
import { BaseQuestionProps } from '../_types';

export function Enumeration({ question, previewMode }: BaseQuestionProps) {
    const acceptedAnswers = question.content.acceptedAnswers || [];
    const count = Math.max(acceptedAnswers.length, 3);

    return (
        <div className="grid gap-2 sm:gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="group relative">
                    <div
                        className={cn(
                            'absolute top-1/2 left-3 flex h-5 w-5 shrink-0 -translate-y-1/2 items-center justify-center rounded-full bg-[#323d8f]/10 text-[9px] font-black text-[#323d8f] sm:left-4 sm:text-[10px]',
                            previewMode === 'mobile' ? 'h-4 w-4 text-[8px]' : 'h-5 w-5 text-[10px]',
                        )}
                    >
                        {i + 1}
                    </div>
                    <Input
                        placeholder={`Item ${i + 1}`}
                        className={cn(
                            'border-border/60 rounded-lg border-2 bg-white pr-4 pl-10 font-bold focus-visible:ring-[#323d8f] sm:rounded-xl sm:pl-12',
                            previewMode === 'mobile' ? 'h-10 text-xs' : 'h-12 text-sm',
                        )}
                    />
                    {acceptedAnswers[i] && (
                        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 sm:right-4">
                            <div className="flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[7px] font-black whitespace-nowrap text-emerald-600 sm:px-2 sm:text-[9px]">
                                <Check className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
                                {acceptedAnswers[i]}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <Button
                variant="ghost"
                className="border-border/60 text-muted-foreground flex h-9 gap-1.5 rounded-lg border-2 border-dashed text-[9px] font-bold hover:bg-white sm:h-10 sm:gap-2 sm:rounded-xl sm:text-xs"
            >
                <ListChecks className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                Add Another Item
            </Button>
        </div>
    );
}
