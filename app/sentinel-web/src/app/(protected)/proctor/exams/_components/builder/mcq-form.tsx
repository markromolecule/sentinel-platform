"use client";

import { Input } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import { RadioGroup, RadioGroupItem } from "@sentinel/ui";
import { ExamQuestionContent } from "@sentinel/shared/types";

interface McqFormProps {
    content: ExamQuestionContent;
    onChange: (updates: Partial<ExamQuestionContent>) => void;
}

export function McqForm({ content, onChange }: McqFormProps) {
    const options = content.options || ['', '', '', ''];
    const correctAnswer = content.correctAnswer || '';

    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ prompt: e.target.value });
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        onChange({ options: newOptions });
    };

    const handleCorrectAnswerChange = (value: string) => {
        onChange({ correctAnswer: value });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Question Statement</Label>
                <Input
                    placeholder="Enter the multiple choice question here..."
                    value={content.prompt}
                    onChange={handlePromptChange}
                />
            </div>

            <div className="space-y-4 pt-2">
                <Label>Options</Label>
                <RadioGroup value={correctAnswer?.toString() || ""} onValueChange={handleCorrectAnswerChange}>
                    {options.map((opt: string, index: number) => {
                        const val = `option-${index}`;
                        return (
                            <div key={index} className="flex items-center space-x-3">
                                <RadioGroupItem value={val} id={`correct-${index}`} />
                                <Input
                                    className="flex-1"
                                    placeholder={`Option ${index + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                />
                                {correctAnswer === val && (
                                    <span className="text-sm text-green-600 font-medium">Correct</span>
                                )}
                            </div>
                        );
                    })}
                </RadioGroup>
                {!correctAnswer && (
                    <p className="text-xs text-amber-600 mt-1">Please select the correct option.</p>
                )}
            </div>
        </div>
    );
}
