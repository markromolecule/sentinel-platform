'use client';

import { useMemo, useState } from 'react';
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@sentinel/ui';
import { ArrowLeft, Copy } from 'lucide-react';
import { getQuestionTypeMeta } from '@/features/exams/builder/_constants/question-type-meta';
import type { QuestionBuilderFormProps } from './_types';
import { getDefaultQuestionContent, isQuestionComplete } from './question-forms/utils';
import type { QuestionDifficulty } from '@sentinel/shared/types';
import {
    MultipleChoiceForm,
    TrueFalseForm,
    IdentificationForm,
    MatchingForm,
    FillBlankForm,
    EssayForm,
} from '@/features/exams/builder/_components/question-forms';

const DEFAULT_POINTS = 1;
const DEFAULT_DIFFICULTY: QuestionDifficulty = 'MODERATE';
const DIFFICULTY_OPTIONS: Array<{
    label: string;
    value: QuestionDifficulty;
}> = [
    { label: 'Easy', value: 'EASY' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'Hard', value: 'HARD' },
];

export function QuestionBuilderForm({
    type,
    initialData,
    questionTypeDefinition,
    onBack,
    onCreate,
    onUpdate,
    onDuplicate,
}: QuestionBuilderFormProps) {
    const meta = getQuestionTypeMeta(type, questionTypeDefinition);
    const Icon = meta.icon;

    const defaultContent = getDefaultQuestionContent(type, questionTypeDefinition);
    const [content, setContent] = useState(() =>
        initialData ? initialData.content : defaultContent,
    );
    const [difficulty, setDifficulty] = useState<QuestionDifficulty>(
        initialData?.difficulty ?? DEFAULT_DIFFICULTY,
    );
    const [points, setPoints] = useState(initialData ? initialData.points : DEFAULT_POINTS);
    const isComplete = useMemo(() => isQuestionComplete(type, content), [content, type]);

    const handleCreateOrUpdate = () => {
        if (!isComplete) return;
        if (initialData && onUpdate) {
            void onUpdate(initialData.id, { type, content, difficulty, points });
        } else {
            void onCreate({ type, content, difficulty, points });
        }
    };

    const handleDuplicate = () => {
        if (!isComplete) return;
        void onDuplicate({ type, content, difficulty, points });
        setContent(defaultContent);
        setDifficulty(DEFAULT_DIFFICULTY);
        setPoints(DEFAULT_POINTS);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <div className="border-border/60 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border">
                    <Icon className="text-muted-foreground h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{meta.label}</h2>
                    <p className="text-muted-foreground text-sm">{meta.description}</p>
                </div>
            </div>

            <div className="border-border/60 bg-background space-y-6 rounded-lg border p-6">
                <div className="grid gap-3">
                    <Label className="text-sm font-medium">Question Prompt</Label>
                    <Textarea
                        placeholder="Type your question here..."
                        className="min-h-[120px]"
                        value={content.prompt ?? ''}
                        onChange={(e) =>
                            setContent((prev) => ({ ...prev, prompt: e.target.value }))
                        }
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid max-w-[200px] gap-3">
                        <Label className="text-sm font-medium">Difficulty</Label>
                        <Select
                            value={difficulty}
                            onValueChange={(value) => setDifficulty(value as QuestionDifficulty)}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                {DIFFICULTY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid max-w-[200px] gap-3">
                        <Label className="text-sm font-medium">Points</Label>
                        <Input
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(Number(e.target.value) || 0)}
                            className="h-9"
                        />
                    </div>
                </div>

                {(type === 'MULTIPLE_CHOICE' || type === 'MULTIPLE_RESPONSE') && (
                    <MultipleChoiceForm
                        content={content}
                        onChange={setContent}
                        mode={type === 'MULTIPLE_RESPONSE' ? 'multiple' : 'single'}
                    />
                )}

                {type === 'TRUE_FALSE' && <TrueFalseForm content={content} onChange={setContent} />}

                {(type === 'IDENTIFICATION' || type === 'ENUMERATION') && (
                    <IdentificationForm type={type} content={content} onChange={setContent} />
                )}

                {type === 'MATCHING' && <MatchingForm content={content} onChange={setContent} />}

                {type === 'FILL_BLANK' && <FillBlankForm content={content} onChange={setContent} />}

                {type === 'ESSAY' && <EssayForm content={content} onChange={setContent} />}
            </div>

            <div className="border-border/60 flex items-center justify-between border-t pt-4">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" /> Cancel
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={!isComplete} onClick={handleDuplicate}>
                        <Copy className="h-4 w-4" /> Duplicate
                    </Button>
                    <Button disabled={!isComplete} onClick={handleCreateOrUpdate}>
                        {initialData ? 'Save Changes' : 'Create'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
