"use client";

import { useMemo, useState } from "react";
import { Button, Input, Label, Textarea } from "@sentinel/ui";
import { ArrowLeft, Copy } from "lucide-react";
import { QUESTION_TYPE_META } from "@/features/exams/builder/_constants/question-type-meta";
import type { QuestionBuilderFormProps } from "./_types";
import { isQuestionComplete, createDefaultContent } from "./question-forms/utils";
import {
    MultipleChoiceForm,
    TrueFalseForm,
    IdentificationForm,
    MatchingForm,
    FillBlankForm,
    EssayForm,
} from "@/features/exams/builder/_components/question-forms";

const DEFAULT_POINTS = 1;

export function QuestionBuilderForm({
    type,
    onBack,
    onCreate,
    onDuplicate,
}: QuestionBuilderFormProps) {
    const meta = QUESTION_TYPE_META[type];
    const Icon = meta.icon;

    // TODO: Implement createDefaultContent
    const [content, setContent] = useState(() => createDefaultContent(type));
    const [points, setPoints] = useState(DEFAULT_POINTS);
    // TODO: Implement isComplete
    const isComplete = useMemo(() => isQuestionComplete(type, content), [content, type]);

    const handleCreate = () => {
        if (isComplete) onCreate({ type, content, points });
    };

    const handleDuplicate = () => {
        if (!isComplete) return;
        onDuplicate({ type, content, points });
        setContent(createDefaultContent(type));
        setPoints(DEFAULT_POINTS);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-md border border-border/60 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{meta.label}</h2>
                    <p className="text-sm text-muted-foreground">{meta.description}</p>
                </div>
            </div>

            <div className="space-y-6 rounded-lg border border-border/60 bg-background p-6">
                <div className="grid gap-3">
                    <Label className="text-sm font-medium">Question Prompt</Label>
                    <Textarea
                        placeholder="Type your question here..."
                        className="min-h-[120px]"
                        value={content.prompt ?? ""}
                        onChange={(e) => setContent(prev => ({ ...prev, prompt: e.target.value }))}
                    />
                </div>

                <div className="grid gap-3 max-w-[200px]">
                    <Label className="text-sm font-medium">Points</Label>
                    <Input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value) || 0)}
                        className="h-9"
                    />
                </div>

                {(type === "MULTIPLE_CHOICE" || type === "MULTIPLE_RESPONSE") && (
                    <MultipleChoiceForm
                        content={content}
                        onChange={setContent}
                        mode={type === "MULTIPLE_RESPONSE" ? "multiple" : "single"}
                    />
                )}

                {type === "TRUE_FALSE" && (
                    <TrueFalseForm content={content} onChange={setContent} />
                )}

                {(type === "IDENTIFICATION" || type === "ENUMERATION") && (
                    <IdentificationForm type={type} content={content} onChange={setContent} />
                )}

                {type === "MATCHING" && (
                    <MatchingForm content={content} onChange={setContent} />
                )}

                {type === "FILL_BLANK" && (
                    <FillBlankForm content={content} onChange={setContent} />
                )}

                {type === "ESSAY" && (
                    <EssayForm content={content} onChange={setContent} />
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" /> Cancel
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={!isComplete} onClick={handleDuplicate}>
                        <Copy className="h-4 w-4" /> Duplicate
                    </Button>
                    <Button disabled={!isComplete} onClick={handleCreate}>
                        Create
                    </Button>
                </div>
            </div>
        </div>
    );
}
