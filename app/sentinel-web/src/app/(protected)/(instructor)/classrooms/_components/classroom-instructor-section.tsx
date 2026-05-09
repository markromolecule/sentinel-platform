'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@sentinel/hooks';
import {
    assignClassroomInstructor,
    getClassroomInstructors,
    removeClassroomInstructor,
} from '@sentinel/services';
import { type ClassroomDetail } from '@sentinel/shared/types';
import { Badge, Button } from '@sentinel/ui';
import { UserPlus, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { AssignClassroomInstructorDialog } from './assign-classroom-instructor-dialog';

type ClassroomInstructorSectionProps = {
    classroom: ClassroomDetail;
};

export function ClassroomInstructorSection({ classroom }: ClassroomInstructorSectionProps) {
    const apiClient = useApi();
    const queryClient = useQueryClient();
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    const instructorsQuery = useQuery({
        queryKey: ['classrooms', classroom.id, 'instructors'],
        queryFn: () => getClassroomInstructors(apiClient, classroom.id),
    });

    const assignMutation = useMutation({
        mutationFn: (instructorUserId: string) =>
            assignClassroomInstructor(apiClient, {
                classroomId: classroom.id,
                instructorUserId,
            }),
        onSuccess: () => {
            toast.success('Instructor assigned successfully.');
            void queryClient.invalidateQueries({
                queryKey: ['classrooms', classroom.id, 'instructors'],
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to assign instructor.');
        },
    });

    const removeMutation = useMutation({
        mutationFn: (instructorUserId: string) =>
            removeClassroomInstructor(apiClient, {
                classroomId: classroom.id,
                instructorUserId,
            }),
        onSuccess: () => {
            toast.success('Instructor removed successfully.');
            void queryClient.invalidateQueries({
                queryKey: ['classrooms', classroom.id, 'instructors'],
            });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to remove instructor.');
        },
    });

    const instructors = instructorsQuery.data ?? [];

    return (
        <>
            <section className="space-y-4 rounded-xl border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Assigned Instructors</h2>
                        <p className="text-muted-foreground text-sm">
                            Classroom teaching access and head-instructor ownership.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAssignOpen(true)}
                        disabled={instructorsQuery.isLoading}
                        className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Instructor
                    </Button>
                </div>

                {instructorsQuery.error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {instructorsQuery.error.message || 'Unable to load classroom instructors.'}
                    </div>
                ) : instructorsQuery.isLoading ? (
                    <div className="text-muted-foreground text-sm">Loading instructors...</div>
                ) : instructors.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                        No instructors are assigned to this classroom yet.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {instructors.map((instructor) => (
                            <div
                                key={instructor.userId}
                                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium">{instructor.name}</span>
                                        {instructor.isHead ? (
                                            <Badge variant="secondary">Head Instructor</Badge>
                                        ) : (
                                            <Badge variant="outline">Assigned Instructor</Badge>
                                        )}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {instructor.assignedAt
                                            ? `Assigned ${new Date(instructor.assignedAt).toLocaleDateString()}`
                                            : 'Assignment date unavailable'}
                                        {instructor.assignedByName
                                            ? ` by ${instructor.assignedByName}`
                                            : ''}
                                    </div>
                                </div>

                                {!instructor.isHead ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => removeMutation.mutate(instructor.userId)}
                                        disabled={removeMutation.isPending}
                                    >
                                        <UserX className="mr-2 h-4 w-4" />
                                        Remove
                                    </Button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <AssignClassroomInstructorDialog
                open={isAssignOpen}
                onOpenChangeAction={setIsAssignOpen}
                institutionId={classroom.institutionId}
                assignedInstructors={instructors}
                onAssignAction={async (instructorUserId) => {
                    await assignMutation.mutateAsync(instructorUserId);
                }}
                isSubmitting={assignMutation.isPending}
            />
        </>
    );
}
