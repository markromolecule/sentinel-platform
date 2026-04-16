'use client';

import { Input, cn } from '@sentinel/ui';
import { BaseQuestionProps } from '../_types';

export function FillBlank({ question, previewMode }: BaseQuestionProps) {
    const prompt = question.content.prompt || '';
    const blanks = question.content.blanks || [];

    return (
        <div className="border-border/40 space-y-4 rounded-lg border-2 bg-white p-4 sm:rounded-2xl sm:p-6">
            <div
                className={cn(
                    'flex flex-wrap items-center gap-1 leading-relaxed font-bold sm:gap-2 sm:leading-loose',
                    previewMode === 'mobile' ? 'text-xs' : 'text-base',
                )}
            >
                {prompt.split(/_{3,}/).map((text, i, arr) => (
                    <span key={i} className="flex flex-wrap items-center gap-1 sm:gap-2">
                        {text}
                        {i < arr.length - 1 && (
                            <span className="relative inline-block">
                                <Input
                                    className={cn(
                                        'rounded-none border-x-0 border-t-0 border-b-2 border-[#323d8f] bg-[#323d8f]/5 p-1 text-center font-black focus-visible:ring-0',
                                        previewMode === 'mobile'
                                            ? 'h-7 w-20 text-[10px]'
                                            : 'h-8 w-32 text-xs',
                                    )}
                                    placeholder={`Blank ${i + 1}`}
                                />
                                <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded border border-emerald-100 bg-emerald-50 px-1 py-0.5 text-[7px] font-black whitespace-nowrap text-emerald-600 sm:-top-6 sm:px-1.5 sm:text-[9px]">
                                    {blanks[i] || 'Answer'}
                                </div>
                            </span>
                        )}
                    </span>
                ))}
            </div>
        </div>
    );
}
