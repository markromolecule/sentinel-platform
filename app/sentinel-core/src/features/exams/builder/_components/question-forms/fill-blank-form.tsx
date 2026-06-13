'use client';

import { Button, Input, Label } from '@sentinel/ui';
import { Plus, Trash2 } from 'lucide-react';
import type { ExamQuestionContent } from '@sentinel/shared/types';

interface FillBlankFormProps {
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
}

export function FillBlankForm({ content, onChange }: FillBlankFormProps) {
    const blanks = content.blanks ?? [''];

    const handleAddBlank = () => {
        onChange({
            ...content,
            blanks: [...blanks, ''],
        });
    };

    const handleRemoveBlank = (index: number) => {
        onChange({
            ...content,
            blanks: blanks.filter((_, i) => i !== index),
        });
    };

    const handleBlankChange = (index: number, value: string) => {
        const nextBlanks = [...blanks];
        nextBlanks[index] = value;
        onChange({
            ...content,
            blanks: nextBlanks,
        });
    };

    return (
        <div className="border-border/60 space-y-4 border-t pt-6">
            <Label className="text-sm font-medium">Blank Answers</Label>
            <div className="space-y-3">
                {blanks.map((blank, idx) => (
                    <div key={idx} className="group flex gap-3">
                        <div className="relative flex-1">
                            <Input
                                placeholder={`Blank ${idx + 1}`}
                                value={blank}
                                onChange={(e) => handleBlankChange(idx, e.target.value)}
                            />
                            {idx > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
                                    onClick={() => handleRemoveBlank(idx)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Button variant="outline" className="w-full border-dashed" onClick={handleAddBlank}>
                <Plus className="h-4 w-4" /> Add Blank
            </Button>
        </div>
    );
}
