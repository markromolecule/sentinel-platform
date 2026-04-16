'use client';

import { Layers, RotateCw, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { BaseQuestionProps } from '../_types';

export function Matching({ question, previewMode }: BaseQuestionProps) {
    const pairs = question.content.pairs || [];

    return (
        <div className="space-y-2 sm:space-y-3">
            {pairs.map((pair, i) => (
                <div
                    key={i}
                    className={cn(
                        'flex items-center gap-2 sm:gap-3',
                        previewMode === 'mobile' ? 'flex-col' : 'flex-row',
                    )}
                >
                    <div
                        className={cn(
                            'border-border/60 flex flex-1 items-center justify-between rounded-lg border-2 bg-white p-3 text-xs font-bold shadow-sm sm:rounded-xl sm:p-4 sm:text-sm',
                            previewMode === 'mobile' ? 'w-full' : '',
                        )}
                    >
                        <span className="break-words">{pair.left}</span>
                        <Layers className="text-muted-foreground/30 ml-2 h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
                    </div>
                    <div className="shrink-0 font-black text-[#323d8f]">
                        {previewMode === 'mobile' ? (
                            <RotateCw className="h-3 w-3 rotate-90 sm:h-4 sm:w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                    </div>
                    <div
                        className={cn(
                            'group relative flex flex-1 items-center justify-between rounded-lg border-2 border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 shadow-sm sm:rounded-xl sm:p-4 sm:text-sm',
                            previewMode === 'mobile' ? 'w-full' : '',
                        )}
                    >
                        <span className="break-words">{pair.right}</span>
                        <CheckCircle2 className="ml-2 h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4" />
                        <div className="absolute -top-2 -right-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[7px] font-black tracking-tighter whitespace-nowrap text-white uppercase shadow-sm sm:text-[8px]">
                            Match
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
