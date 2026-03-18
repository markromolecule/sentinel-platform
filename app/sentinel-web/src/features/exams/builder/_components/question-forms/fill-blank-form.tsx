"use client";

import { Button, Input, Label } from "@sentinel/ui";
import { Plus, Trash2 } from "lucide-react";
import type { ExamQuestionContent } from "@sentinel/shared/types";

interface FillBlankFormProps {
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
}

export function FillBlankForm({ content, onChange }: FillBlankFormProps) {
    const blanks = content.blanks ?? [""];

    const handleAddBlank = () => {
        onChange({
            ...content,
            blanks: [...blanks, ""],
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
        <div className="space-y-4 pt-6 border-t border-border/60">
            <Label className="text-sm font-medium">Blank Answers</Label>
            <div className="space-y-3">
                {blanks.map((blank, idx) => (
                    <div key={idx} className="flex gap-3 group">
                        <div className="flex-1 relative">
                            <Input
                                placeholder={`Blank ${idx + 1}`}
                                value={blank}
                                onChange={(e) => handleBlankChange(idx, e.target.value)}
                            />
                            {idx > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveBlank(idx)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={handleAddBlank}
            >
                <Plus className="h-4 w-4" /> Add Blank
            </Button>
        </div>
    );
}
