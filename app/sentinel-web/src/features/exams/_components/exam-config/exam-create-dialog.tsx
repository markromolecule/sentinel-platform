"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Separator,
} from "@sentinel/ui";
import { ExamCreateForm } from "./exam-create-form";
import type { ExamCreateDialogProps } from "@sentinel/shared/types";

export function ExamCreateDialog({ open, onOpenChange }: ExamCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100vh-1.5rem)] flex-col gap-0 overflow-hidden border-border/60 p-0 sm:max-w-5xl data-[state=open]:animate-none data-[state=closed]:animate-none">
                <DialogHeader className="gap-0">
                    <div className="space-y-1 px-4 pb-0 pt-2">
                        <DialogTitle className="text-xl text-[#323d8f]">Create New Exam</DialogTitle>
                        <DialogDescription>
                            Set the details, schedule, and exam options in one page, then continue to the builder.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <Separator />
                <ExamCreateForm onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    );
}
