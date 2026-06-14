'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@sentinel/ui';
import { NewAssignmentsBuilder } from './new-assignments-builder';

export interface AddExamSectionAssignmentDialogProps {
    examId: string;
    subjectId?: string;
    currentAssignments: any[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddExamSectionAssignmentDialog({
    examId,
    subjectId,
    currentAssignments,
    open,
    onOpenChange,
    onSuccess,
}: AddExamSectionAssignmentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl md:max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Assign Classrooms</DialogTitle>
                    <DialogDescription>
                        Select classrooms, rooms, and proctors to assign to this exam.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <NewAssignmentsBuilder
                        examId={examId}
                        subjectId={subjectId}
                        currentAssignments={currentAssignments}
                        onSuccess={() => {
                            onSuccess?.();
                            onOpenChange(false);
                        }}
                        onCancel={() => onOpenChange(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
