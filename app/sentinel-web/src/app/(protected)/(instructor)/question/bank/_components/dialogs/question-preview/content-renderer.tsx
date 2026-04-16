'use client';

import {
    MultipleChoicePreview,
    TrueFalsePreview,
    IdentificationPreview,
    MultipleResponsePreview,
    EssayPreview,
} from '@/app/(protected)/(instructor)/question/bank/_components/views/preview';
import { QuestionTableItem } from '@/app/(protected)/(instructor)/question/bank/_components/tables/columns';
import { QuestionType } from '@sentinel/shared/types';
import { ReactNode } from 'react';

/*
 * Registry mapping question types to their respective preview components.
 * This makes the renderer highly scalable for new question types.
 */
const PREVIEW_REGISTRY: Partial<Record<QuestionType, (question: QuestionTableItem) => ReactNode>> =
    {
        MULTIPLE_CHOICE: (q) => (
            <MultipleChoicePreview
                content={{
                    options: q.content.options || [],
                    correctAnswer:
                        typeof q.content.correctAnswer === 'string'
                            ? q.content.correctAnswer
                            : undefined,
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
        IDENTIFICATION: (q) => (
            <IdentificationPreview
                content={{
                    acceptedAnswers: q.content.acceptedAnswers,
                }}
            />
        ),
        MULTIPLE_RESPONSE: (q) => (
            <MultipleResponsePreview
                content={{
                    options: q.content.options || [],
                    correctAnswer: Array.isArray(q.content.correctAnswer)
                        ? q.content.correctAnswer.map(String)
                        : [],
                }}
            />
        ),
        ESSAY: (q) => (
            <EssayPreview
                content={{
                    rubric: q.content.rubric,
                    maxLength: q.content.maxLength,
                }}
            />
        ),
        // Types that currently use the fallback but are marked for future components
        MATCHING: (q) => (
            <DefaultFallback
                label="Pairs Defined"
                value={`${q.content.pairs?.length || 0} items`}
            />
        ),
        FILL_BLANK: (q) => (
            <DefaultFallback label="Blanks" value={`${q.content.blanks?.length || 0} items`} />
        ),
        ENUMERATION: (q) => (
            <DefaultFallback
                label="Accepted Answers"
                value={`${q.content.acceptedAnswers?.length || 0} items`}
            />
        ),
    };

function DefaultFallback({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800/50 dark:bg-zinc-900/30">
            <p className="mb-2 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                {label}:
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
        </div>
    );
}

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
        <DefaultFallback
            label="Correct Answer"
            value={String(question.content.correctAnswer ?? 'N/A')}
        />
    );
}
