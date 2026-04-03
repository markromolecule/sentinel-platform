"use client";

import { Label, Textarea } from "@sentinel/ui";

interface AiTabProps {
    prompt: string;
    onPromptChange: (prompt: string) => void;
}

export function AiTab({ prompt, onPromptChange }: AiTabProps) {
    return (
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="ai-prompt" className="text-sm font-semibold">
                    Describe your questions
                </Label>
                <Textarea
                    id="ai-prompt"
                    placeholder="Example: Create 5 multiple-choice questions about software engineering principles for a mid-level developer interview..."
                    className="min-h-[120px] resize-none"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                />
                <p className="text-xs text-zinc-500 italic">
                    AI drafting will be enabled once this workflow is connected to a live generation service.
                </p>
            </div>
        </div>
    );
}
