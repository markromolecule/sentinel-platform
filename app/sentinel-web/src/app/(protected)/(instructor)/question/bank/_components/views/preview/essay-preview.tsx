'use client';

import { AlignLeft, Hash, ShieldCheck } from 'lucide-react';
import { ESSAY_RUBRIC_CRITERIA } from '@sentinel/shared';

interface EssayPreviewProps {
    content: {
        maxLength?: number;
    };
}

export function EssayPreview({ content }: EssayPreviewProps) {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <AlignLeft className="text-primary h-4 w-4" />
                <span className="text-xs font-bold tracking-wider uppercase">
                    Essay Configuration
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-tight text-zinc-400 uppercase">
                        <Hash className="h-3 w-3" />
                        Max Length
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {content.maxLength ? `${content.maxLength} characters` : 'None'}
                    </span>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-tight text-zinc-400 uppercase">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        Rubric
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Standard Rubric Applied
                    </span>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-800/50 space-y-3">
                <p className="text-xs font-bold tracking-tight text-zinc-400 uppercase">
                    Rubric Criteria & Weights:
                </p>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                    {ESSAY_RUBRIC_CRITERIA.map((c) => (
                        <div key={c.key} className="flex justify-between py-2 items-center">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{c.name}</span>
                            <span className="font-mono text-zinc-900 dark:text-zinc-100 bg-zinc-200/50 dark:bg-zinc-700 px-2 py-0.5 rounded">
                                {c.weight * 100}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
