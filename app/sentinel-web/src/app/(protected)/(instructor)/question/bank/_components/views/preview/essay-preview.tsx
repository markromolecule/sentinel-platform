'use client';

import { AlignLeft, FileText, Hash } from 'lucide-react';

interface EssayPreviewProps {
    content: {
        rubric?: string;
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
                        <FileText className="h-3 w-3" />
                        Rubric
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {content.rubric ? 'Rubric defined' : 'No rubric'}
                    </span>
                </div>
            </div>

            {content.rubric && (
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-800/50">
                    <p className="mb-2 text-xs font-bold tracking-tight text-zinc-400 uppercase">
                        Grading Rubric:
                    </p>
                    <p className="text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                        {content.rubric}
                    </p>
                </div>
            )}
        </div>
    );
}
