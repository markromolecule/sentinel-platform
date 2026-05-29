'use client';

import { useState } from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Label,
} from '@sentinel/ui';
import { type ClassroomInstructor } from '@sentinel/shared/types';
import { InstructorSearchCombobox } from './instructor-search-combobox';

type AssignClassroomInstructorDialogProps = {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    institutionId?: string | null;
    assignedInstructors: ClassroomInstructor[];
    onAssignAction: (instructorUserId: string) => Promise<void>;
    isSubmitting?: boolean;
};

export function AssignClassroomInstructorDialog({
    open,
    onOpenChangeAction,
    institutionId,
    assignedInstructors,
    onAssignAction,
    isSubmitting = false,
}: AssignClassroomInstructorDialogProps) {
    const [selectedInstructorId, setSelectedInstructorId] = useState('');

    const handleClose = () => {
        setSelectedInstructorId('');
        onOpenChangeAction(false);
    };

    const handleSubmit = async () => {
        if (!selectedInstructorId) {
            return;
        }

        await onAssignAction(selectedInstructorId);
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    handleClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Instructor</DialogTitle>
                    <DialogDescription>
                        Add another instructor to this classroom. Head-instructor ownership stays
                        unchanged.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="classroom-instructor-combobox">Instructor</Label>
                        {institutionId && (
                            <InstructorSearchCombobox
                                value={selectedInstructorId}
                                onValueChange={setSelectedInstructorId}
                                institutionId={institutionId}
                                excludeUserIds={assignedInstructors.map((i) => i.userId)}
                                placeholder="Search and select an instructor..."
                            />
                        )}
                    </div>

                    {!institutionId ? (
                        <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                            Classroom institution metadata is missing.
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => void handleSubmit()}
                            disabled={!selectedInstructorId || isSubmitting}
                            className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                        >
                            {isSubmitting ? 'Assigning...' : 'Assign Instructor'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

