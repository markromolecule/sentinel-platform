"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExamQuestionContent } from "@sentinel/shared/types";

interface IdentificationFormProps {
    content: ExamQuestionContent;
    onChange: (updates: Partial<ExamQuestionContent>) => void;
}

export function IdentificationForm({ content, onChange }: IdentificationFormProps) {
    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ prompt: e.target.value });
    };

    const handleAcceptedAnswersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parts = e.target.value.split(',').map(s => s.trim());
        onChange({ acceptedAnswers: parts });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Question Statement</Label>
                <Input
                    placeholder="Enter the identification question here..."
                    value={content.prompt}
                    onChange={handlePromptChange}
                />
            </div>

            <div className="space-y-2">
                <Label>Accepted Answers (Comma separated)</Label>
                <Input
                    placeholder="E.g. Mitochondria, The Mitochondria"
                    value={content.acceptedAnswers?.join(', ') || ''}
                    onChange={handleAcceptedAnswersChange}
                />
                <p className="text-xs text-slate-500">Provide all valid variations of the correct answer, separated by commas. Case-insensitive matching will be applied during evaluation.</p>
            </div>
        </div>
    );
}
