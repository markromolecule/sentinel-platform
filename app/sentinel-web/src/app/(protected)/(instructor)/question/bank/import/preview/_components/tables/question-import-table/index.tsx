"use client";

import * as React from "react";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Checkbox,
} from "@sentinel/ui";
import { Pencil, Trash2 } from "lucide-react";
import { GenerateQuestionPreviewResponse } from "@sentinel/shared";

type Question = GenerateQuestionPreviewResponse['questions'][number];

interface QuestionImportTableProps {
    questions: Question[];
    selectedQuestions: Set<number>;
    onToggleSelect: (index: number) => void;
    onToggleSelectAll: () => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    pageStartIndex?: number;
}

export function QuestionImportTable({
    questions,
    selectedQuestions,
    onToggleSelect,
    onToggleSelectAll,
    onEdit,
    onDelete,
    pageStartIndex = 0,
}: QuestionImportTableProps) {
    const isAllSelected = questions.length > 0 && questions.every((_, index) => selectedQuestions.has(pageStartIndex + index));
    const isSomeSelected = questions.length > 0 && questions.some((_, index) => selectedQuestions.has(pageStartIndex + index));
    const checkedState = isAllSelected ? true : isSomeSelected ? 'indeterminate' : false;

    return (
        <div className="rounded-md border border-border/40 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="w-[50px] text-center">
                            <Checkbox 
                                checked={checkedState}
                                onCheckedChange={onToggleSelectAll}
                                aria-label="Select all"
                            />
                        </TableHead>
                        <TableHead className="w-[60px] text-center text-xs uppercase tracking-widest text-muted-foreground font-bold">#</TableHead>
                        <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Question Content</TableHead>
                        <TableHead className="w-[140px] text-xs uppercase tracking-widest text-muted-foreground font-bold">Type</TableHead>
                        <TableHead className="w-[100px] text-xs uppercase tracking-widest text-muted-foreground font-bold text-center">Difficulty</TableHead>
                        <TableHead className="w-[100px] text-center text-xs uppercase tracking-widest text-muted-foreground font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {questions.map((question, index) => {
                        const questionIndex = pageStartIndex + index;
                        const isSelected = selectedQuestions.has(questionIndex);
                        
                        return (
                            <TableRow 
                                key={questionIndex}
                                className={`group hover:bg-muted/20 transition-colors ${!isSelected ? "opacity-60" : ""}`}
                            >
                                <TableCell className="text-center">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => onToggleSelect(questionIndex)}
                                        aria-label={`Select question ${questionIndex + 1}`}
                                    />
                                </TableCell>
                                <TableCell className="text-center text-sm font-medium text-muted-foreground">
                                    {questionIndex + 1}
                                </TableCell>
                                <TableCell
                                    className="max-w-[400px] cursor-pointer"
                                    onClick={() => onEdit(questionIndex)}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="text-sm font-medium line-clamp-2 group-hover:text-[#323d8f] transition-colors">
                                            {(question.content as Record<string, unknown>)['prompt'] as string || (question.content as Record<string, unknown>)['stem'] as string || "No question text"}
                                        </div>
                                        {question.tags && question.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {question.tags.map((tag, tIdx) => (
                                                    <span key={tIdx} className="text-[10px] text-muted-foreground">#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight bg-slate-50 dark:bg-slate-800/50">
                                        {question.type.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800">
                                        {question.difficulty}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            onClick={() => onEdit(questionIndex)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => onDelete(questionIndex)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
