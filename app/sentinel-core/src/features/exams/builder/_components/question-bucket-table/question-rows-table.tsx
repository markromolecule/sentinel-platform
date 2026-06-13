'use client';

import * as React from 'react';
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
} from '@sentinel/ui';
import { Database, GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { ExamQuestion } from '@sentinel/shared/types';

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
    onAddToBank,
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
    onAddToBank?: (questionId: string) => void | Promise<void>;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground w-[72px] text-center text-xs tracking-widest uppercase">
                        #
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs tracking-widest uppercase">
                        Question
                    </TableHead>
                    <TableHead className="text-muted-foreground w-[100px] text-center text-xs tracking-widest uppercase">
                        Points
                    </TableHead>
                    <TableHead className="text-muted-foreground w-[192px] text-center text-xs tracking-widest uppercase">
                        Actions
                    </TableHead>
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
                                'hover:bg-muted/40',
                                isDragging && 'bg-muted/60 opacity-70',
                                isDropTarget && 'bg-muted/70',
                            )}
                            onDragOver={onDragOver(index)}
                            onDrop={onDrop(index)}
                        >
                            <TableCell className="text-muted-foreground text-center text-sm">
                                <button
                                    type="button"
                                    draggable
                                    onDragStart={onDragStart(index)}
                                    onDragEnd={onDragEnd}
                                    className="text-muted-foreground hover:bg-muted mx-auto flex h-8 w-10 cursor-grab items-center justify-center gap-1 rounded-md transition active:cursor-grabbing"
                                    aria-label={`Reorder question ${questionNumber}`}
                                    title="Drag to reorder question"
                                >
                                    <GripVertical className="h-3.5 w-3.5" />
                                    <span className="text-sm">{questionNumber}</span>
                                </button>
                            </TableCell>
                            <TableCell
                                className="max-w-[420px] cursor-pointer"
                                title={question.content.prompt}
                                onClick={() => onEdit(question.id)}
                            >
                                <div className="truncate text-sm font-medium text-blue-600 underline">
                                    {question.content.prompt}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    {question.sourceOrigin === 'AI_PDF'
                                        ? `${question.sourceFileName} • Page ${question.sourcePageNumber}`
                                        : 'Manual entry'}
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-center text-sm">
                                {question.points}
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center gap-2">
                                    {!question.sourceQuestionBankQuestionId ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary hover:bg-primary/10 hover:text-primary h-8 gap-1 px-2"
                                            onClick={() => void onAddToBank?.(question.id)}
                                            title="Add to Question Bank"
                                        >
                                            <Database className="h-4 w-4" />
                                            <span className="text-xs">Bank</span>
                                        </Button>
                                    ) : null}
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
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
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
                    <TableCell colSpan={2} className="text-muted-foreground text-sm">
                        {footerLabel}
                    </TableCell>
                    <TableCell className="text-center text-sm font-semibold">
                        {footerPoints} pts
                    </TableCell>
                    <TableCell />
                </TableRow>
            </TableFooter>
        </Table>
    );
}
