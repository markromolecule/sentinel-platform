"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { MoveUp, MoveDown, Pencil, Trash2, GripVertical, Plus } from "lucide-react";
import type { ExamQuestion } from "../types";
import { QUESTION_TYPE_META } from "../question-meta";

interface QuestionBucketTableProps {
    questions: ExamQuestion[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onAdd: () => void;
}

export const QuestionBucketTable = ({
    questions,
    onEdit,
    onDelete,
    onAdd,
}: QuestionBucketTableProps) => {
    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/50 rounded-3xl bg-secondary/5 space-y-6">
                <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20 animate-pulse">
                    <Plus className="h-10 w-10 text-primary/40" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">No questions yet</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        Get started by adding your first question to the exam bucket.
                    </p>
                </div>
                <Button 
                    onClick={onAdd}
                    className="font-bold px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" /> Add First Question
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs">
                        {questions.length}
                    </span>
                    Questions in Bucket
                </h3>
                <Button variant="outline" size="sm" onClick={onAdd} className="font-semibold border-2 border-dashed">
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
            </div>
            
            <div className="border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-secondary/40">
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="font-bold text-foreground">Type</TableHead>
                            <TableHead className="font-bold text-foreground">Question Text</TableHead>
                            <TableHead className="font-bold text-foreground w-[100px] text-right">Points</TableHead>
                            <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questions.map((q, idx) => {
                            const meta = QUESTION_TYPE_META[q.type];
                            const Icon = meta.icon;
                            return (
                                <TableRow key={q.id || idx} className="group hover:bg-primary/5 border-border/30 transition-colors">
                                    <TableCell className="py-4">
                                        <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing group-hover:text-muted-foreground transition-colors" />
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-background border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                                                <Icon className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                                                {meta.label}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 font-medium max-w-md">
                                        <p className="truncate group-hover:text-primary transition-colors">{q.prompt}</p>
                                    </TableCell>
                                    <TableCell className="py-4 text-right font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                        {q.points} pts
                                    </TableCell>
                                    <TableCell className="py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(idx)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(idx)}>
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
            
            <div className="flex justify-center pt-4">
                <Button 
                    variant="ghost" 
                    onClick={onAdd}
                    className="w-full max-w-xs border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all font-bold rounded-xl h-14"
                >
                    <Plus className="mr-2 h-5 w-5" /> Add Question
                </Button>
            </div>
        </div>
    );
};
