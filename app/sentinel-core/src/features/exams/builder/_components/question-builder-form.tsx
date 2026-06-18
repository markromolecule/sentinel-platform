'use client';

import { useMemo, useState } from 'react';
import {
    Badge,
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Textarea,
} from '@sentinel/ui';
import { ArrowLeft, Copy, Eye, X } from 'lucide-react';
import { getQuestionTypeMeta } from '@/features/exams/builder/_constants/question-type-meta';
import type { QuestionBuilderFormProps } from './_types';
import { getDefaultQuestionContent, isQuestionComplete } from './question-forms/utils';
import type { PassageType, QuestionDifficulty } from '@sentinel/shared/types';
import { PassageEditor, htmlToPlainText } from '@sentinel/ui';
import { apiClient } from '@/data/api/client';
import { uploadPassageImage } from '@sentinel/services';
import { renderPassage, renderPlainPassage } from '@sentinel/shared';
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
    builderMode = false,
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
    const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
    const [tagInput, setTagInput] = useState('');
    const [passageType, setPassageType] = useState<PassageType>(
        initialData?.passageType ?? 'plain',
    );
    const [passageContent, setPassageContent] = useState(
        initialData?.passageContent ?? initialData?.sourceEvidence ?? '',
    );
    const [isPassagePreviewOpen, setIsPassagePreviewOpen] = useState(false);

    const isComplete = useMemo(() => isQuestionComplete(type, content), [content, type]);
    const passageTextContent = htmlToPlainText(passageContent).trim();
    const hasPassage =
        passageType === 'html' ? passageTextContent.length > 0 : passageContent.trim().length > 0;
    const passagePreview = renderPassage({
        passageContent: hasPassage ? passageContent : null,
        passageType: hasPassage ? passageType : null,
    });

    const handlePassageTypeChange = (nextPassageType: PassageType) => {
        if (nextPassageType === passageType) {
            return;
        }

        setPassageContent((currentContent) =>
            nextPassageType === 'html'
                ? renderPlainPassage(htmlToPlainText(currentContent))
                : htmlToPlainText(currentContent),
        );
        setPassageType(nextPassageType);
    };

    const handlePassageImageUpload = async (file: File) => {
        const uploadedImage = await uploadPassageImage(apiClient, file);
        return uploadedImage.url;
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleCreateOrUpdate = () => {
        if (!isComplete) return;
        const normalizedPassageContent =
            passageType === 'html'
                ? passageTextContent.length > 0
                    ? passageContent
                    : null
                : passageContent.trim()
                  ? passageContent
                  : null;
        const normalizedPassageType = normalizedPassageContent ? passageType : 'plain';
        if (initialData && onUpdate) {
            void onUpdate(initialData.id, {
                type,
                content,
                difficulty,
                points,
                tags,
                passageContent: normalizedPassageContent,
                passageType: normalizedPassageType,
            });
        } else {
            void onCreate({
                type,
                content,
                difficulty,
                points,
                tags,
                passageContent: normalizedPassageContent,
                passageType: normalizedPassageType,
            });
        }
    };

    const handleDuplicate = () => {
        if (!isComplete || !onDuplicate) return;
        void onDuplicate({
            type,
            content,
            difficulty,
            points,
            tags,
            passageContent:
                passageType === 'html'
                    ? passageTextContent.length > 0
                        ? passageContent
                        : null
                    : passageContent.trim()
                      ? passageContent
                      : null,
            passageType:
                passageType === 'html' && passageTextContent.length === 0 ? 'plain' : passageType,
        });
        setContent(defaultContent);
        setDifficulty(DEFAULT_DIFFICULTY);
        setPoints(DEFAULT_POINTS);
        setTags([]);
        setPassageType('plain');
        setPassageContent('');
    };

    return (
        <div className={builderMode ? 'w-full space-y-8' : 'mx-auto max-w-7xl space-y-6'}>
            {!builderMode ? (
                <div className="flex items-center gap-4">
                    <div className="border-border/60 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border">
                        <Icon className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">{meta.label}</h2>
                        <p className="text-muted-foreground text-sm">{meta.description}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="border-border/60 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border">
                            <Icon className="text-muted-foreground h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">{meta.label}</h2>
                            <p className="text-muted-foreground text-sm">{meta.description}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4" /> Cancel
                        </Button>
                        {onDuplicate ? (
                            <Button variant="outline" disabled={!isComplete} onClick={handleDuplicate}>
                                <Copy className="h-4 w-4" /> Duplicate
                            </Button>
                        ) : null}
                        <Button disabled={!isComplete} onClick={handleCreateOrUpdate}>
                            {initialData ? 'Save Changes' : 'Create'}
                        </Button>
                    </div>
                </div>
            )}

            {builderMode ? <Separator /> : null}

            <div className="grid gap-8 xl:grid-cols-2 xl:items-stretch">
                <div className="min-w-0 h-full flex flex-col gap-6">
                    <section className={builderMode ? 'space-y-6' : 'border-border/60 bg-background space-y-6 rounded-2xl border p-6 shadow-sm'}>
                        <div className="grid gap-3">
                            <Label className="text-sm font-medium">Question Prompt</Label>
                            <Textarea
                                placeholder="Type your question here..."
                                className={builderMode ? 'min-h-[180px]' : 'min-h-[160px]'}
                                value={content.prompt ?? ''}
                                onChange={(e) =>
                                    setContent((prev) => ({ ...prev, prompt: e.target.value }))
                                }
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid max-w-[220px] gap-3">
                                <Label className="text-sm font-medium">Difficulty</Label>
                                <Select
                                    value={difficulty}
                                    onValueChange={(value) =>
                                        setDifficulty(value as QuestionDifficulty)
                                    }
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

                            <div className="grid max-w-[220px] gap-3">
                                <Label className="text-sm font-medium">Points</Label>
                                <Input
                                    type="number"
                                    value={points}
                                    onChange={(e) => setPoints(Number(e.target.value) || 0)}
                                    className="h-9"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label className="text-sm font-medium">Tags</Label>
                            <div className="border-border/60 bg-background focus-within:ring-ring flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border px-3 py-2 focus-within:ring-2 focus-within:ring-offset-2">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="flex items-center gap-1 py-0.5"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-destructive h-3 w-3"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <input
                                    placeholder={
                                        tags.length === 0
                                            ? 'Add tags (press Enter or comma to add)...'
                                            : 'Add more tags...'
                                    }
                                    className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
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

                        {type === 'TRUE_FALSE' && (
                            <TrueFalseForm content={content} onChange={setContent} />
                        )}

                        {(type === 'IDENTIFICATION' || type === 'ENUMERATION') && (
                            <IdentificationForm type={type} content={content} onChange={setContent} />
                        )}

                        {type === 'MATCHING' && <MatchingForm content={content} onChange={setContent} />}

                        {type === 'FILL_BLANK' && (
                            <FillBlankForm content={content} onChange={setContent} />
                        )}

                        {type === 'ESSAY' && <EssayForm content={content} onChange={setContent} />}
                    </section>
                </div>

                <aside className="min-w-0 h-full flex flex-col">
                    <section className={builderMode ? 'h-full space-y-4' : 'border-border/60 bg-background rounded-2xl border p-6 shadow-sm'}>
                        <Collapsible defaultOpen={hasPassage} className="h-full space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium">Passage</Label>
                                        <p className="text-muted-foreground text-xs">
                                            Keep the passage and the question side by side while you edit.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={() => setIsPassagePreviewOpen(true)}
                                            disabled={!passagePreview}
                                        >
                                            <Eye className="h-4 w-4" />
                                            Preview passage
                                        </Button>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" type="button">
                                                {hasPassage ? 'Hide' : 'Add'} passage
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                </div>
                            <CollapsibleContent className="h-full space-y-4">
                                <div className="grid max-w-[220px] gap-3">
                                    <Label className="text-sm font-medium">Passage type</Label>
                                    <Select
                                        value={passageType}
                                        onValueChange={(value) =>
                                            handlePassageTypeChange(value as PassageType)
                                        }
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select passage type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="plain">Plain text</SelectItem>
                                            <SelectItem value="html">HTML</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-3">
                                    <Label className="text-sm font-medium">
                                        {passageType === 'html' ? 'Passage HTML' : 'Passage text'}
                                    </Label>
                                    {passageType === 'html' ? (
                                        <PassageEditor
                                            value={passageContent}
                                            onChange={setPassageContent}
                                            placeholder="<p>Write rich passage HTML here...</p>"
                                            onImageUpload={handlePassageImageUpload}
                                            className={builderMode ? 'h-full' : undefined}
                                        />
                                    ) : (
                                        <Textarea
                                            placeholder="Write the passage text here..."
                                            className={builderMode ? 'min-h-[540px] h-full' : 'min-h-[300px]'}
                                            value={passageContent}
                                            onChange={(e) => setPassageContent(e.target.value)}
                                        />
                                    )}
                                    <p className="text-muted-foreground text-xs">
                                        {passageType === 'html'
                                            ? 'HTML passages are sanitized on render. Keep images on stable URLs and use valid markup.'
                                            : 'Plain passages render as literal text with line breaks preserved.'}
                                    </p>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </section>
                </aside>
            </div>

            <Dialog open={isPassagePreviewOpen} onOpenChange={setIsPassagePreviewOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Passage Preview</DialogTitle>
                        <DialogDescription>
                            This is a live preview of how the current passage will render.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="border-border/60 bg-background max-h-[70vh] overflow-auto rounded-lg border p-4">
                        {passagePreview ? (
                            <div
                                className="text-sm leading-6 text-foreground"
                                dangerouslySetInnerHTML={{ __html: passagePreview.html }}
                            />
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Add passage content to see a preview.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
