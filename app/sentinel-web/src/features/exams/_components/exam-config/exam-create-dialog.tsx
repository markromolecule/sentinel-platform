"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";
import { ExamCreateForm } from "./exam-create-form";
import type { ExamCreateDialogProps } from "@sentinel/shared/types";

export function ExamCreateDialog({ open, onOpenChange }: ExamCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg data-[state=open]:animate-none data-[state=closed]:animate-none">
                {/* TODO: Implement dialog header */}
                <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new proctored exam.
                    </DialogDescription>
                </DialogHeader>

                {/* TODO: Implement exam create form */}
                <ExamCreateForm onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    );
}
