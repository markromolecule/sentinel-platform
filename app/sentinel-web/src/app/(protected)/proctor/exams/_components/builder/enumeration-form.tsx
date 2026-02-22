"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

import { ExamQuestionContent } from "@sentinel/shared/types";

interface EnumerationFormProps {
    content: ExamQuestionContent;
    onChange: (updates: Partial<ExamQuestionContent>) => void;
}

export function EnumerationForm({ content, onChange }: EnumerationFormProps) {
    const answers: string[] = content.acceptedAnswers || [''];

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({ prompt: e.target.value });
    };

    const handleExactOrderChange = (checked: boolean) => {
        onChange({ exactOrder: checked });
    };

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        onChange({ acceptedAnswers: newAnswers });
    };

    const addAnswerField = () => {
        onChange({ acceptedAnswers: [...answers, ''] });
    };

    const removeAnswerField = (index: number) => {
        const newAnswers = answers.filter((_, i) => i !== index);
        onChange({ acceptedAnswers: newAnswers.length ? newAnswers : [''] });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Question Statement</Label>
                <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="List the components of..."
                    value={content.prompt}
                    onChange={handlePromptChange}
                />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                <div className="space-y-0.5">
                    <Label className="text-sm">Require Exact Order</Label>
                    <p className="text-xs text-slate-500">Must the student provide the answers in the exact order listed below?</p>
                </div>
                <Switch
                    checked={content.exactOrder || false}
                    onCheckedChange={handleExactOrderChange}
                />
            </div>

            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <Label>Expected Answers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAnswerField} className="h-7 text-xs">
                        <Plus className="mr-1 w-3 h-3" /> Add items
                    </Button>
                </div>

                {answers.map((ans: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-400 w-6">{index + 1}.</span>
                        <Input
                            value={ans}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder={`Item ${index + 1}`}
                            className="flex-1"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-400 hover:text-red-500"
                            onClick={() => removeAnswerField(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
