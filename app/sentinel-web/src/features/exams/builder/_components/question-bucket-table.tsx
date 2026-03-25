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
import { Plus, Trash2, Database } from "lucide-react";
import type { ExamQuestion } from "@sentinel/shared/types";
import type { QuestionBucketTableProps } from "./_types";

export function QuestionBucketTable({
    questions,
    onEdit,
    onDelete,
    onAdd,
    onImport,
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
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onImport} className="gap-2 text-[#323d8f] border-[#323d8f]/20 hover:bg-[#323d8f]/10">
                                <Database className="h-4 w-4" /> Import from Bank
                            </Button>
                            <Button onClick={onAdd} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Question
                            </Button>
                        </div>
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
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onImport} className="gap-2 text-[#323d8f] border-[#323d8f]/20 hover:bg-[#323d8f]/10">
                                <Database className="h-4 w-4" /> Import from Bank
                            </Button>
                            <Button variant="outline" onClick={onAdd} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Question
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[60px] text-xs uppercase tracking-widest text-muted-foreground text-center">#</TableHead>
                                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Question</TableHead>
                                <TableHead className="w-[100px] text-xs uppercase tracking-widest text-muted-foreground text-center">Points</TableHead>
                                <TableHead className="w-[80px] text-xs uppercase tracking-widest text-muted-foreground text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {questions.map((q, idx) => {
                                return (
                                    <TableRow key={q.id || idx} className="hover:bg-muted/40">
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-blue-600 underline cursor-pointer max-w-[420px] truncate" title={q.content.prompt} onClick={() => onEdit(q.id)}>
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
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
