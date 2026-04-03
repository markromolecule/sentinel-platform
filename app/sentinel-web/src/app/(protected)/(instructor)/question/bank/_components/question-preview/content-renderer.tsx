"use client";

import {
    MultipleChoicePreview,
    TrueFalsePreview
} from "@/app/(protected)/(instructor)/question/bank/_components/preview";
import { QuestionTableItem } from "@/app/(protected)/(instructor)/question/bank/_components/columns";
import { QuestionType } from "@sentinel/shared/types";
import { ReactNode } from "react";

/*
 * Registry mapping question types to their respective preview components.
 * This makes the renderer highly scalable for new question types.
 */
const PREVIEW_REGISTRY: Partial<Record<QuestionType, (question: QuestionTableItem) => ReactNode>> = {
    MULTIPLE_CHOICE: (q) => (
        <MultipleChoicePreview
            content={{
                options: q.content.options || [],
                correctAnswer: typeof q.content.correctAnswer === "string" ? q.content.correctAnswer : undefined,
            }}
        />
    ),
    TRUE_FALSE: (q) => (
        <TrueFalsePreview
            content={{
                correctBoolean: q.content.correctBoolean,
            }}
        />
    ),
};

interface ContentRendererProps {
    question: QuestionTableItem;
}

/*
 * Renders the content of the question based on its type using a registry lookup.
 */
export function QuestionContentRenderer({ question }: ContentRendererProps) {
    const renderPreview = PREVIEW_REGISTRY[question.type];

    if (renderPreview) {
        return renderPreview(question);
    }
    // Default fallback for unknown or unhandled question types
    return (
        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase mb-1">Correct Answer:</p>
            <p className="text-sm font-mono">
                {String(question.content.correctAnswer ?? "N/A")}
            </p>
        </div>
    );
}
