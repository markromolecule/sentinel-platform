"use client";

import { Button, Input, Label } from "@sentinel/ui";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import type { ExamQuestionContent } from "@sentinel/shared/types";

interface MultipleChoiceFormProps {
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
    mode?: "single" | "multiple";
}

export function MultipleChoiceForm({
    content,
    onChange,
    mode = "single",
}: MultipleChoiceFormProps) {
    const options = content.options ?? ["", ""];
    const isMultiple = mode === "multiple";
    const selectedOptions = isMultiple && Array.isArray(content.correctAnswer)
        ? content.correctAnswer
        : [];
    const selectedSingle = !isMultiple && typeof content.correctAnswer === "string"
        ? content.correctAnswer
        : "";

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        const previousValue = newOptions[index];
        newOptions[index] = value;

        const next: ExamQuestionContent = { ...content, options: newOptions };

        if (isMultiple) {
            if (Array.isArray(content.correctAnswer)) {
                const nextSelected = content.correctAnswer
                    .filter((option) => option !== previousValue)
                    .filter(Boolean);
                if (value.trim()) {
                    nextSelected.push(value);
                }
                next.correctAnswer = Array.from(new Set(nextSelected));
            }
        } else if (content.correctAnswer === previousValue) {
            next.correctAnswer = value;
        }

        onChange(next);
    };

    const handleRemoveOption = (index: number) => {
        const removed = options[index];
        const newOptions = options.filter((_, idx) => idx !== index);

        const next: ExamQuestionContent = { ...content, options: newOptions };

        if (isMultiple) {
            if (Array.isArray(content.correctAnswer)) {
                next.correctAnswer = content.correctAnswer.filter(
                    (option) => option !== removed,
                );
            }
        } else if (content.correctAnswer === removed) {
            next.correctAnswer = "";
        }

        onChange(next);
    };

    const handleAddOption = () => {
        onChange({
            ...content,
            options: [...options, ""],
        });
    };

    const handleSelect = (option: string) => {
        if (!option.trim()) return;
        if (isMultiple) {
            const nextSelected = new Set(selectedOptions);
            if (nextSelected.has(option)) {
                nextSelected.delete(option);
            } else {
                nextSelected.add(option);
            }
            onChange({
                ...content,
                correctAnswer: Array.from(nextSelected),
            });
            return;
        }
        onChange({
            ...content,
            correctAnswer: option,
        });
    };

    return (
        <div className="space-y-4 pt-6 border-t border-border/60">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Answer Options</Label>
                <span className="text-xs text-muted-foreground">
                    {isMultiple ? "Select all that apply" : "Mark the correct answer"}
                </span>
            </div>
            <div className="space-y-3">
                {options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                        <Button
                            variant={
                                isMultiple
                                    ? selectedOptions.includes(option) && option !== ""
                                        ? "default"
                                        : "outline"
                                    : selectedSingle === option && option !== ""
                                        ? "default"
                                        : "outline"
                            }
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleSelect(option)}
                        >
                            {(isMultiple
                                ? selectedOptions.includes(option)
                                : selectedSingle === option) && option !== "" && (
                                <CheckCircle2 className="h-4 w-4" />
                            )}
                        </Button>
                        <div className="flex-1 relative">
                            <Input
                                value={option}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                                className="pr-10"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveOption(idx)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={handleAddOption}
            >
                <Plus className="h-4 w-4" /> Add Option
            </Button>
        </div>
    );
}
