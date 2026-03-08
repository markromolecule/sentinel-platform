"use client";

import { Input } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import { RadioGroup, RadioGroupItem } from "@sentinel/ui";

import { ExamQuestionContent } from "@sentinel/shared/types";

interface TrueFalseFormProps {
    content: ExamQuestionContent;
    onChange: (updates: Partial<ExamQuestionContent>) => void;
}

export function TrueFalseForm({ content, onChange }: TrueFalseFormProps) {
    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ prompt: e.target.value });
    };

    const handleCorrectAnswerChange = (value: string) => {
        onChange({ correctAnswer: value === 'true' });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Question Statement</Label>
                <Input
                    placeholder="Enter the true or false statement here..."
                    value={content.prompt}
                    onChange={handlePromptChange}
                />
            </div>

            <div className="space-y-4 pt-2">
                <Label>Correct Answer</Label>
                <RadioGroup
                    value={content.correctAnswer === true ? 'true' : content.correctAnswer === false ? 'false' : undefined}
                    onValueChange={handleCorrectAnswerChange}
                    className="flex flex-row gap-6"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="tf-true" />
                        <Label htmlFor="tf-true" className="font-normal cursor-pointer">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="tf-false" />
                        <Label htmlFor="tf-false" className="font-normal cursor-pointer">False</Label>
                    </div>
                </RadioGroup>

                {content.correctAnswer === undefined && (
                    <p className="text-xs text-amber-600 mt-1">Please select the correct answer.</p>
                )}
            </div>
        </div>
    );
}
