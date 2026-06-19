'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sentinel/ui';
import { type ExamSectionAssignmentRecord } from '@sentinel/services';
import { NewAssignmentsBuilder } from './new-assignments-builder';

export interface AddExamSectionAssignmentDialogProps {
    examId: string;
    subjectId?: string;
    currentAssignments: ExamSectionAssignmentRecord[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

/**
 * AddExamSectionAssignmentDialog wraps the multi-row assignment builder in a dialog.
 */
export function AddExamSectionAssignmentDialog({
    examId,
    subjectId,
    currentAssignments,
    open,
    onOpenChange,
    onSuccess,
}: AddExamSectionAssignmentDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onOpenChange(false);
                }
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-4xl md:max-w-5xl dark:bg-zinc-900">
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
