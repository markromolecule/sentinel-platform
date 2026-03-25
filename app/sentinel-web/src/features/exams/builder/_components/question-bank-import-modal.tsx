"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";
import { Button, Checkbox, Badge } from "@sentinel/ui";
import { useQuestionBank } from "@/features/questions/store/use-question-bank";
import { type ExamQuestion } from "@sentinel/shared/types";

interface QuestionBankImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (questions: ExamQuestion[]) => void;
}

export function QuestionBankImportModal({
    open,
    onOpenChange,
    onImport,
}: QuestionBankImportModalProps) {
    const { questions } = useQuestionBank();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleQuestion = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleImport = () => {
        const toImport = questions.filter((q) => selectedIds.includes(q.id));
        onImport(toImport);
        onOpenChange(false);
        setSelectedIds([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>Import from Question Bank</DialogTitle>
                            <DialogDescription>
                                Select the questions you want to add to this exam.
                            </DialogDescription>
                        </div>
                        {questions.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40">
                                <Checkbox 
                                    id="select-all"
                                    checked={selectedIds.length === questions.length && questions.length > 0}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedIds(questions.map(q => q.id));
                                        } else {
                                            setSelectedIds([]);
                                        }
                                    }}
                                />
                                <label htmlFor="select-all" className="text-xs font-medium cursor-pointer select-none">
                                    Select All
                                </label>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {questions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground italic text-sm">
                            The question bank is currently empty.
                        </div>
                    ) : (
                        questions.map((q) => (
                            <div
                                key={q.id}
                                className="flex items-start gap-4 p-4 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors cursor-pointer"
                                onClick={() => toggleQuestion(q.id)}
                            >
                                <Checkbox
                                    checked={selectedIds.includes(q.id)}
                                    className="mt-1"
                                    onCheckedChange={() => toggleQuestion(q.id)}
                                />
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge variant="secondary" className="text-[10px] uppercase">
                                            {q.type.replace('_', ' ')}
                                        </Badge>
                                        <span className="text-xs font-mono text-muted-foreground">
                                            {q.points} pts
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium line-clamp-2">
                                        {q.content.prompt}
                                    </p>
                                    {q.tags && q.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {q.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1 border-border/40">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={selectedIds.length === 0}
                        onClick={handleImport}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white"
                    >
                        Import {selectedIds.length > 0 ? `(${selectedIds.length})` : ""} Questions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
