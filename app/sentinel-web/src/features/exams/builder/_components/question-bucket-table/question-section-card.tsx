"use client";

import * as React from "react";
import {
    Badge,
    Button,
    Collapsible,
    CollapsibleContent,
    Input,
    cn,
} from "@sentinel/ui";
import { ChevronDown, Database, GripVertical, Plus, Trash2 } from "lucide-react";
import type { ExamQuestionSection } from "@sentinel/shared/types";

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
    onDeleteSection,
    onToggleCollapse,
    onImportQuestions,
    onAddQuestion,
    children,
}: {
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
    onDeleteSection?: () => void;
    onToggleCollapse: () => void;
    onImportQuestions: () => void;
    onAddQuestion: () => void;
    children?: React.ReactNode;
}) {
    const isOpen = !section.isCollapsed;

    return (
        <Collapsible open={isOpen}>
            <div
                className={cn(
                    "overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-colors",
                    isSectionDragging && "opacity-70",
                    isSectionDropTarget && "border-foreground/20 bg-muted/30",
                )}
                onDragEnterCapture={onSectionDragEnter}
                onDragOverCapture={onSectionDragOver}
                onDropCapture={onSectionDrop}
            >
                <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/30 px-4 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                draggable
                                onDragStart={onSectionDragStart}
                                onDragEnd={onSectionDragEnd}
                                className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg border border-border/60 bg-background text-foreground shadow-sm transition hover:bg-muted active:cursor-grabbing"
                                aria-label={`Reorder ${section.title}`}
                                title="Drag to reorder section"
                            >
                                <GripVertical className="h-4 w-4" />
                            </button>

                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground shadow-sm transition hover:bg-muted"
                                aria-label={isOpen ? `Collapse ${section.title}` : `Expand ${section.title}`}
                            >
                                <ChevronDown className={cn("h-4 w-4 transition-transform", !isOpen && "-rotate-90")} />
                            </button>

                            <div className="min-w-0">
                                <Input
                                    value={section.title}
                                    onChange={(event) => onSectionTitleChange(event.target.value)}
                                    className="h-10 bg-background text-base font-semibold shadow-none"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{questionCount} questions</Badge>
                            <Badge variant="secondary">{totalPoints} pts</Badge>
                            <Button type="button" variant="outline" onClick={onImportQuestions} className="gap-2">
                                <Database className="h-4 w-4" />
                                Import from Bank
                            </Button>
                            <Button type="button" variant="outline" onClick={onAddQuestion} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Question
                            </Button>
                            {onDeleteSection ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onDeleteSection}
                                    className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Section
                                </Button>
                            ) : null}
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
