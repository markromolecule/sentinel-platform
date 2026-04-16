'use client';

import { CheckCircle2 } from 'lucide-react';

interface MultipleChoicePreviewProps {
    content: {
        options?: string[];
        correctAnswer?: string;
    };
}

export function MultipleChoicePreview({ content }: MultipleChoicePreviewProps) {
    return (
        <div className="space-y-4">
            <p className="text-sm font-medium">Options:</p>
            <div className="space-y-2">
                {content.options?.map((option: string) => (
                    <div
                        key={option}
                        className={`flex items-center gap-2 rounded-md border p-3 ${
                            option === content.correctAnswer
                                ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                                : 'border-border/60'
                        }`}
                    >
                        {option === content.correctAnswer ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                            <div className="border-muted-foreground/30 h-4 w-4 rounded-full border" />
                        )}
                        <span className="text-sm">{option}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
