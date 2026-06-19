'use client';

import * as React from 'react';
import { Badge, Button, Collapsible, CollapsibleContent, Input, Textarea, cn } from '@sentinel/ui';
import { ChevronDown, Database, GripVertical, Plus, PencilLine, Trash2 } from 'lucide-react';
import type { ExamQuestionSection } from '@sentinel/shared/types';

type QuestionSectionCardProps = {
    section: ExamQuestionSection;
    questionCount: number;
    totalPoints: number;
    isSectionDragging: boolean;
    isSectionDropTarget: boolean;
    onSectionDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
    onSectionDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
    onSectionDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onSectionDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onSectionDragEnd: () => void;
    onSectionTitleChange: (title: string) => void;
    onSectionDescriptionChange: (description: string) => void;
    onDeleteSection?: () => void;
    onToggleCollapse: () => void;
    onImportQuestions: () => void;
    onAddQuestion: () => void;
    children?: React.ReactNode;
};

/**
 * QuestionSectionCard renders a single exam section card with reorder, collapse, and
 * plain-text instruction editing controls.
 *
 * @param props - QuestionSectionCardProps describing the section UI and callbacks.
 */
export function QuestionSectionCard({
    section,
    questionCount,
    totalPoints,
    isSectionDragging,
    isSectionDropTarget,
    onSectionDragStart,
    onSectionDragEnter,
    onSectionDragOver,
    onSectionDrop,
    onSectionDragEnd,
    onSectionTitleChange,
    onSectionDescriptionChange,
    onDeleteSection,
    onToggleCollapse,
    onImportQuestions,
    onAddQuestion,
    children,
}: QuestionSectionCardProps) {
    const isOpen = !section.isCollapsed;
    const hasInstruction = Boolean(section.description?.trim());
    const [isInstructionEditorOpen, setIsInstructionEditorOpen] = React.useState(hasInstruction);

    React.useEffect(() => {
        if (hasInstruction) {
            setIsInstructionEditorOpen(true);
        }
    }, [hasInstruction]);

    return (
        <Collapsible open={isOpen}>
            <div
                className={cn(
                    'border-border/60 bg-background overflow-hidden rounded-2xl border shadow-sm transition-colors',
                    isSectionDragging && 'opacity-70',
                    isSectionDropTarget && 'border-foreground/20 bg-muted/30',
                )}
                onDragEnterCapture={onSectionDragEnter}
                onDragOverCapture={onSectionDragOver}
                onDropCapture={onSectionDrop}
            >
                <div className="border-border/60 bg-muted/30 flex flex-col gap-4 border-b px-4 py-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <button
                                type="button"
                                draggable
                                onDragStart={onSectionDragStart}
                                onDragEnd={onSectionDragEnd}
                                className="border-border/60 bg-background text-foreground hover:bg-muted flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg border shadow-sm transition active:cursor-grabbing"
                                aria-label={`Reorder ${section.title}`}
                                title="Drag to reorder section"
                            >
                                <GripVertical className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                className="border-border/60 bg-background text-foreground hover:bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm transition"
                                aria-label={
                                    isOpen ? `Collapse ${section.title}` : `Expand ${section.title}`
                                }
                            >
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 transition-transform',
                                        !isOpen && '-rotate-90',
                                    )}
                                />
                            </button>

                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
                                        Section title
                                    </p>
                                    <Input
                                        aria-label={`${section.title} title`}
                                        value={section.title}
                                        onChange={(event) =>
                                            onSectionTitleChange(event.target.value)
                                        }
                                        className="bg-background h-11 text-base font-semibold shadow-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                            <Badge variant="secondary">{questionCount} questions</Badge>
                            <Badge variant="secondary">{totalPoints} pts</Badge>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onImportQuestions}
                                className="gap-2"
                            >
                                <Database className="h-4 w-4" />
                                Import from Bank
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onAddQuestion}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Question
                            </Button>
                            {onDeleteSection ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onDeleteSection}
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Section
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="border-border/60 bg-background/80 rounded-xl border p-3 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 space-y-1">
                                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
                                    Section instruction
                                </p>
                                <p className="text-foreground/80 text-sm leading-relaxed">
                                    {hasInstruction
                                        ? section.description
                                        : 'No instruction added yet. Use plain text to guide students through this section.'}
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsInstructionEditorOpen((current) => !current)}
                                className="gap-2 self-start"
                            >
                                <PencilLine className="h-4 w-4" />
                                {isInstructionEditorOpen
                                    ? 'Hide Editor'
                                    : hasInstruction
                                      ? 'Edit Instruction'
                                      : 'Add Instruction'}
                            </Button>
                        </div>

                        <div
                            className={cn(
                                'overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
                                isInstructionEditorOpen
                                    ? 'max-h-80 opacity-100'
                                    : 'max-h-0 opacity-0',
                            )}
                        >
                            <div className="pt-3">
                                <Textarea
                                    aria-label={`${section.title} instructions`}
                                    value={section.description ?? ''}
                                    onChange={(event) =>
                                        onSectionDescriptionChange(event.target.value)
                                    }
                                    placeholder="Write plain-text instructions for this section"
                                    className="bg-background min-h-24 resize-y text-sm shadow-none"
                                />
                                <p className="text-muted-foreground mt-2 text-xs">
                                    Plain text only. Keep the guidance clear and concise.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="px-0 py-0">{children}</div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
