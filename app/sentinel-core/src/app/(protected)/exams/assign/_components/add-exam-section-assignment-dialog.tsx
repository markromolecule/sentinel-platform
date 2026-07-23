'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@sentinel/ui';
import { NewAssignmentsBuilder } from './new-assignments-builder';

export interface AddExamSectionAssignmentDialogProps {
    examId: string;
    examTitle?: string;
    subjectId?: string;
    currentAssignments: any[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddExamSectionAssignmentDialog({
    examId,
    examTitle,
    subjectId,
    currentAssignments,
    open,
    onOpenChange,
    onSuccess,
}: AddExamSectionAssignmentDialogProps) {
    const [isSaving, setIsSaving] = React.useState(false);

    return (
        <Dialog
            open={open}
            onOpenChange={(val) => {
                if (isSaving) return;
                onOpenChange(val);
            }}
        >
            <DialogContent
                onEscapeKeyDown={(e) => isSaving && e.preventDefault()}
                onPointerDownOutside={(e) => isSaving && e.preventDefault()}
                className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-4xl md:max-w-5xl dark:bg-zinc-900"
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">
                        Assign instructors and classrooms
                    </DialogTitle>
                    <DialogDescription>
                        {examTitle
                            ? `For examination: ${examTitle}`
                            : 'Manage classroom, room, and instructor assignments.'}
                        <span className="mt-1 block text-xs font-medium text-zinc-500">
                            All fields (Classroom, Room, and Instructor) are required for every
                            assignment.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <NewAssignmentsBuilder
                        examId={examId}
                        subjectId={subjectId}
                        currentAssignments={currentAssignments}
                        onSavingChange={setIsSaving}
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
