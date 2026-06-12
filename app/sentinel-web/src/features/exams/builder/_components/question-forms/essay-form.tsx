'use client';

import { Input, Label } from '@sentinel/ui';
import type { ExamQuestionContent } from '@sentinel/shared/types';
import { Info } from 'lucide-react';

interface EssayFormProps {
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
}

export function EssayForm({ content, onChange }: EssayFormProps) {
    return (
        <div className="border-border/60 space-y-4 border-t pt-6">
            <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/40 p-4 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-semibold text-blue-950 dark:text-blue-200">Standardized Rubric Applied</p>
                    <p className="text-blue-800/80 dark:text-blue-300/80 mt-1">
                        This essay question will be graded using the standardized institutional rubric: Content & Substance (30%), Structure & Organization (20%), Argumentation & Support (20%), Style & Tone (15%), and Grammar & Conventions (15%).
                    </p>
                </div>
            </div>
            
            <div className="grid max-w-[200px] gap-3">
                <Label className="text-sm font-medium">Max Length</Label>
                <Input
                    type="number"
                    value={content.maxLength ?? 1000}
                    onChange={(e) =>
                        onChange({
                            ...content,
                            maxLength: Number(e.target.value) || 0,
                        })
                    }
                    className="h-9"
                />
            </div>
        </div>
    );
}
