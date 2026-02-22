"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ExamQuestionContent } from "@sentinel/shared/types";

interface EssayFormProps {
    content: ExamQuestionContent;
    onChange: (updates: Partial<ExamQuestionContent>) => void;
}

export function EssayForm({ content, onChange }: EssayFormProps) {
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({ prompt: e.target.value });
    };

    const handleRubricChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({ rubric: e.target.value });
    };

    const handleMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ maxLength: parseInt(e.target.value) || undefined });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Essay Prompt</Label>
                <Textarea
                    placeholder="Enter the essay prompt here..."
                    value={content.prompt}
                    onChange={handlePromptChange}
                    className="min-h-[100px]"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <Label>Grading Rubric / Context (Optional)</Label>
                    <Textarea
                        placeholder="Provide guidelines for grading this essay..."
                        value={content.rubric || ''}
                        onChange={handleRubricChange}
                        className="min-h-[100px] text-sm text-slate-600"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Max Character Length</Label>
                    <Input
                        type="number"
                        placeholder="e.g. 2000"
                        value={content.maxLength || ''}
                        onChange={handleMaxLengthChange}
                    />
                </div>
            </div>
        </div>
    );
}
