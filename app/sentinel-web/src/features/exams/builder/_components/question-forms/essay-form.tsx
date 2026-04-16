'use client';

import { Input, Label, Textarea } from '@sentinel/ui';
import type { ExamQuestionContent } from '@sentinel/shared/types';

interface EssayFormProps {
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
}

export function EssayForm({ content, onChange }: EssayFormProps) {
    return (
        <div className="border-border/60 space-y-4 border-t pt-6">
            <Label className="text-sm font-medium">Rubric (Optional)</Label>
            <Textarea
                placeholder="Describe how the response will be evaluated..."
                className="min-h-[100px]"
                value={content.rubric ?? ''}
                onChange={(e) =>
                    onChange({
                        ...content,
                        rubric: e.target.value,
                    })
                }
            />
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
