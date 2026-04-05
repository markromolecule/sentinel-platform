"use client";

import { AlignLeft, FileText, Hash } from "lucide-react";

interface EssayPreviewProps {
    content: {
        rubric?: string;
        maxLength?: number;
    };
}

export function EssayPreview({ content }: EssayPreviewProps) {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <AlignLeft className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">Essay Configuration</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-tight">
                        <Hash className="w-3 h-3" />
                        Max Length
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {content.maxLength ? `${content.maxLength} characters` : "None"}
                    </span>
                </div>

                <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-tight">
                        <FileText className="w-3 h-3" />
                        Rubric
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {content.rubric ? "Rubric defined" : "No rubric"}
                    </span>
                </div>
            </div>

            {content.rubric && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-left">
                    <p className="text-xs font-bold uppercase tracking-tight text-zinc-400 mb-2">Grading Rubric:</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{content.rubric}</p>
                </div>
            )}
        </div>
    );
}
