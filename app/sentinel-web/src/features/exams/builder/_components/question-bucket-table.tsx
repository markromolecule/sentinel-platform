"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@sentinel/ui";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    CardTitle,
    Button,
} from "@sentinel/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { QUESTION_TYPE_META } from "@/features/exams/builder/_constants/question-type-meta";
import type { ExamQuestion } from "@sentinel/shared/types";
import type { QuestionBucketTableProps } from "./_types";

export function QuestionBucketTable({
    questions,
    onEdit,
    onDelete,
    onAdd,
}: QuestionBucketTableProps) {
    const totalPoints = questions.reduce(
        (sum: number, question: ExamQuestion) => sum + (question.points || 0),
        0,
    );

    if (questions.length === 0) {
        return (
            <div className="mx-auto w-full max-w-5xl">
                <Card className="shadow-none">
                    <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
                        <div className="h-10 w-10 rounded-full border border-border/60 flex items-center justify-center">
                            <Plus className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-medium">No questions yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Add your first question to build the exam.
                            </p>
                        </div>
                        <Button onClick={onAdd} className="gap-2">
                            <Plus className="h-4 w-4" /> Add Question
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl">
            <Card className="shadow-none">
                <CardHeader className="border-b border-border/60 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                            Questions ({questions.length})
                        </CardTitle>
                        <Button variant="outline" onClick={onAdd} className="gap-2">
                            <Plus className="h-4 w-4" /> Add Question
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[60px] text-xs uppercase tracking-widest text-muted-foreground text-center">#</TableHead>
                                <TableHead className="w-[90px] text-xs uppercase tracking-widest text-muted-foreground text-center">Type</TableHead>
                                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Question</TableHead>
                                <TableHead className="w-[100px] text-xs uppercase tracking-widest text-muted-foreground text-center">Points</TableHead>
                                <TableHead className="w-[120px] text-xs uppercase tracking-widest text-muted-foreground text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {questions.map((q, idx) => {
                                const meta = QUESTION_TYPE_META[q.type];
                                const Icon = meta.icon;
                                return (
                                    <TableRow key={q.id || idx} className="hover:bg-muted/40">
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="h-8 w-8 rounded-md border border-border/60 flex items-center justify-center">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                                    {meta.label}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-foreground max-w-[420px] truncate" title={q.content.prompt}>
                                            {q.content.prompt}
                                        </TableCell>
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {q.points}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => onEdit(q.id)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => onDelete(q.id)}
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
                </CardContent>
                <CardFooter className="justify-between border-t pt-4">
                    <span className="text-sm text-muted-foreground">Total Points</span>
                    <span className="text-sm font-semibold">{totalPoints} pts</span>
                </CardFooter>
            </Card>
        </div>
    );
}
