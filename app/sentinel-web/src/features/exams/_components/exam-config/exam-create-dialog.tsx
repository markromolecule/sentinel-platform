"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";
import { ExamCreateForm } from "@/features/exams/_components/exam-config/exam-create-form";
import type { ExamCreateDialogProps } from "@sentinel/shared/types";

export function ExamCreateDialog({ open, onOpenChange }: ExamCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100vh-1.5rem)] flex-col gap-0 overflow-hidden border-border/60 p-0 sm:max-w-5xl data-[state=open]:animate-none data-[state=closed]:animate-none">
                <DialogHeader className="gap-0 border-b border-border/40">
                    <div className="space-y-1.5 px-8 pt-7 pb-5 bg-secondary/5">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-[#323d8f]">Create New Exam</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-muted-foreground/80">
                            Set the exam metadata first, then continue straight to the builder.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <ExamCreateForm onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    );
}
