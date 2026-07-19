import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sentinel/ui';
import { type ExamSectionAssignmentRecord } from '@sentinel/services';
import { NewAssignmentsBuilder } from './new-assignments-builder';

export interface AddExamSectionAssignmentDialogProps {
    examId: string;
    examTitle?: string;
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
    examTitle,
    subjectId,
    currentAssignments,
    open,
    onOpenChange,
    onSuccess,
}: AddExamSectionAssignmentDialogProps) {
    const [isSaving, setIsSaving] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (isSaving) return;
            onOpenChange(val);
        }}>
            <DialogContent
                onEscapeKeyDown={(e) => isSaving && e.preventDefault()}
                onPointerDownOutside={(e) => isSaving && e.preventDefault()}
                className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-4xl md:max-w-5xl dark:bg-zinc-900"
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Assign instructors and classrooms</DialogTitle>
                    <DialogDescription>
                        {examTitle ? `For examination: ${examTitle}` : 'Manage classroom, room, and instructor assignments.'}
                        <div className="mt-1 text-xs text-zinc-500 font-medium">
                            All fields (Classroom, Room, and Instructor) are required for every assignment.
                        </div>
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
