"use client";

import { Button, Input, Label } from "@sentinel/ui";
import { Plus, Trash2 } from "lucide-react";
import type { ExamQuestionContent, QuestionType } from "@sentinel/shared/types";

interface IdentificationFormProps {
    type: QuestionType;
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
}

export function IdentificationForm({ type, content, onChange }: IdentificationFormProps) {
    const acceptedAnswers = content.acceptedAnswers ?? [""];

    const handleAddAnswer = () => {
        onChange({
            ...content,
            acceptedAnswers: [...acceptedAnswers, ""],
        });
    };

    const handleRemoveAnswer = (index: number) => {
        onChange({
            ...content,
            acceptedAnswers: acceptedAnswers.filter((_, i) => i !== index),
        });
    };

    const handleAnswerChange = (index: number, value: string) => {
        const nextAnswers = [...acceptedAnswers];
        nextAnswers[index] = value;
        onChange({
            ...content,
            acceptedAnswers: nextAnswers,
        });
    };

    return (
        <div className="space-y-4 pt-6 border-t border-border/60">
            <Label className="text-sm font-medium">
                {type === "IDENTIFICATION" ? "Accepted Answers" : "Enumerated Items"}
            </Label>
            <div className="space-y-3">
                {acceptedAnswers.map((answer, idx) => (
                    <div key={idx} className="flex gap-3 group">
                        <div className="flex-1 relative">
                            <Input
                                placeholder={
                                    type === "IDENTIFICATION"
                                        ? "Enter correct alternative..."
                                        : `Item ${idx + 1}`
                                }
                                value={answer}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            />
                            {idx > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveAnswer(idx)}
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
                onClick={handleAddAnswer}
            >
                <Plus className="h-4 w-4" /> Add{" "}
                {type === "IDENTIFICATION" ? "Alternative" : "Item"}
            </Button>
        </div>
    );
}
