"use client";

import * as React from "react";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
    cn,
} from "@sentinel/ui";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { ExamQuestion } from "@sentinel/shared/types";

export function QuestionRowsTable({
    questions,
    questionNumberOffset = 0,
    footerLabel,
    footerPoints,
    draggedIndex,
    dropTargetIndex,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    onEdit,
    onDelete,
}: {
    questions: ExamQuestion[];
    questionNumberOffset?: number;
    footerLabel: string;
    footerPoints: number;
    draggedIndex: number | null;
    dropTargetIndex: number | null;
    onDragStart: (index: number) => (event: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd: () => void;
    onDragOver: (index: number) => (event: React.DragEvent<HTMLTableRowElement>) => void;
    onDrop: (index: number) => (event: React.DragEvent<HTMLTableRowElement>) => void;
    onEdit: (questionId: string) => void;
    onDelete: (questionId: string) => void;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[72px] text-center text-xs uppercase tracking-widest text-muted-foreground">#</TableHead>
                    <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Question</TableHead>
                    <TableHead className="w-[100px] text-center text-xs uppercase tracking-widest text-muted-foreground">Points</TableHead>
                    <TableHead className="w-[112px] text-center text-xs uppercase tracking-widest text-muted-foreground">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {questions.map((question, index) => {
                    const questionNumber = questionNumberOffset + index + 1;
                    const isDragging = draggedIndex === index;
                    const isDropTarget = dropTargetIndex === index && draggedIndex !== index;

                    return (
                        <TableRow
                            key={question.id || index}
                            className={cn(
                                "hover:bg-muted/40",
                                isDragging && "bg-muted/60 opacity-70",
                                isDropTarget && "bg-muted/70",
                            )}
                            onDragOver={onDragOver(index)}
                            onDrop={onDrop(index)}
                        >
                            <TableCell className="text-center text-sm text-muted-foreground">
                                <button
                                    type="button"
                                    draggable
                                    onDragStart={onDragStart(index)}
                                    onDragEnd={onDragEnd}
                                    className="mx-auto flex h-8 w-10 cursor-grab items-center justify-center gap-1 rounded-md text-muted-foreground transition hover:bg-muted active:cursor-grabbing"
                                    aria-label={`Reorder question ${questionNumber}`}
                                    title="Drag to reorder question"
                                >
                                    <GripVertical className="h-3.5 w-3.5" />
                                    <span className="text-sm">{questionNumber}</span>
                                </button>
                            </TableCell>
                            <TableCell
                                className="max-w-[420px] cursor-pointer truncate text-sm font-medium text-blue-600 underline"
                                title={question.content.prompt}
                                onClick={() => onEdit(question.id)}
                            >
                                {question.content.prompt}
                            </TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground">
                                {question.points}
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => onEdit(question.id)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => onDelete(question.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
            <TableFooter>
                <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={2} className="text-sm text-muted-foreground">
                        {footerLabel}
                    </TableCell>
                    <TableCell className="text-center text-sm font-semibold">{footerPoints} pts</TableCell>
                    <TableCell />
                </TableRow>
            </TableFooter>
        </Table>
    );
}
