"use client";

import { CheckCircle2 } from "lucide-react";

interface IdentificationPreviewProps {
    content: {
        acceptedAnswers?: string[];
    };
}

export function IdentificationPreview({ content }: IdentificationPreviewProps) {
    const answers = content.acceptedAnswers || [];

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Accepted Answers</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {answers.length > 0 ? (
                    answers.map((answer, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-400"
                        >
                            {answer}
                        </div>
                    ))
                ) : (
                    <span className="text-sm text-zinc-400 italic font-mono">No accepted answers defined</span>
                )}
            </div>
        </div>
    );
}
