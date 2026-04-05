"use client";

import { CheckSquare } from "lucide-react";
import { cn } from "@sentinel/ui";

interface MultipleResponsePreviewProps {
    content: {
        options: string[];
        correctAnswer?: string[];
    };
}

export function MultipleResponsePreview({ content }: MultipleResponsePreviewProps) {
    const options = content.options || [];
    const correctAnswers = Array.isArray(content.correctAnswer) ? content.correctAnswer : [];

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">Multiple Response</span>
            </div>

            <div className="grid gap-3">
                {options.map((option, index) => {
                    const isCorrect = correctAnswers.includes(option);
                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all duration-200",
                                isCorrect
                                    ? "bg-primary/10 border-primary/20 text-primary-900 dark:text-primary-100"
                                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                            )}
                        >
                            <div className={cn(
                                "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors",
                                isCorrect ? "bg-primary text-white" : "border-2 border-zinc-300 dark:border-zinc-700"
                            )}>
                                {isCorrect && <CheckSquare className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-sm font-medium">{option}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
