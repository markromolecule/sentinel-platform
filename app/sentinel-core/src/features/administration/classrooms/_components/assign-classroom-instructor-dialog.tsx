'use client';

import { useMemo, useState } from 'react';
import { useUsersQuery } from '@sentinel/hooks';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { type ClassroomInstructor } from '@sentinel/shared/types';

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
    const { data: instructors = [], isLoading } = useUsersQuery({
        role: 'instructor',
        institutionId: institutionId ?? undefined,
        enabled: open && Boolean(institutionId),
    });

    const availableInstructors = useMemo(() => {
        const assignedUserIds = new Set(assignedInstructors.map((instructor) => instructor.userId));

        return instructors.filter((instructor) => !assignedUserIds.has(instructor.id));
    }, [assignedInstructors, instructors]);

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
                        <Label htmlFor="classroom-instructor-select">Instructor</Label>
                        <Select
                            value={selectedInstructorId || undefined}
                            onValueChange={setSelectedInstructorId}
                            disabled={isLoading || availableInstructors.length === 0}
                        >
                            <SelectTrigger id="classroom-instructor-select">
                                <SelectValue placeholder="Select an instructor" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableInstructors.map((instructor) => (
                                    <SelectItem key={instructor.id} value={instructor.id}>
                                        {[instructor.firstName, instructor.lastName]
                                            .filter(Boolean)
                                            .join(' ') || instructor.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!institutionId ? (
                        <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                            Classroom institution metadata is missing.
                        </div>
                    ) : null}

                    {institutionId && !isLoading && availableInstructors.length === 0 ? (
                        <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                            No additional instructors are available for this classroom.
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
