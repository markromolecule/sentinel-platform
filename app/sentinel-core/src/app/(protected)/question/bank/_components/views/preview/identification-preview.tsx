'use client';

import { CheckCircle2 } from 'lucide-react';

interface IdentificationPreviewProps {
    content: {
        acceptedAnswers?: string[];
    };
}

export function IdentificationPreview({ content }: IdentificationPreviewProps) {
    const answers = content.acceptedAnswers || [];

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold tracking-wider uppercase">Accepted Answers</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {answers.length > 0 ? (
                    answers.map((answer, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                        >
                            {answer}
                        </div>
                    ))
                ) : (
                    <span className="font-mono text-sm text-zinc-400 italic">
                        No accepted answers defined
                    </span>
                )}
            </div>
        </div>
    );
}
