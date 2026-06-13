'use client';

import * as React from 'react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Button,
    Spinner,
} from '@sentinel/ui';
import { Trash2, Calendar, MapPin, User, Plus } from 'lucide-react';
import { useDeleteExamSectionAssignmentMutation } from '@sentinel/hooks';
import { type ExamSectionAssignmentRecord } from '@sentinel/services';
import { toast } from 'sonner';

export interface ExamSectionAssignmentListProps {
    examId: string;
    assignments: ExamSectionAssignmentRecord[];
    isLoading: boolean;
    onAssignClick: () => void;
}

export function ExamSectionAssignmentList({
    examId,
    assignments,
    isLoading,
    onAssignClick,
}: ExamSectionAssignmentListProps) {
    const deleteMutation = useDeleteExamSectionAssignmentMutation({
        onSuccess: () => {
            toast.success('Assignment removed successfully');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to remove assignment');
        },
    });

    const handleDelete = async (assignmentId: string) => {
        if (confirm('Are you sure you want to remove this section assignment?')) {
            await deleteMutation.mutateAsync({
                examId,
                id: assignmentId,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Spinner className="text-primary size-8" />
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-white dark:bg-zinc-900">
                <div className="bg-[#323d8f]/10 text-[#323d8f] rounded-full p-3">
                    <Plus className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Sections Assigned</h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                    This exam hasn&apos;t been assigned to any sections yet. Assign a section to make the exam available.
                </p>
                <Button onClick={onAssignClick} className="bg-[#323d8f] hover:bg-[#323d8f]/90 mt-4">
                    Assign Section
                </Button>
            </div>
        );
    }

    const formatDateTime = (isoString: string | null) => {
        if (!isoString) return 'Not scheduled';
        const date = new Date(isoString);
        return date.toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div className="rounded-xl border bg-white shadow-xs dark:bg-zinc-900">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-semibold">Section</TableHead>
                        <TableHead className="font-semibold">Room</TableHead>
                        <TableHead className="font-semibold">Instructor / Proctor</TableHead>
                        <TableHead className="font-semibold">Scheduled Time</TableHead>
                        <TableHead className="w-[100px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                            <TableCell className="font-medium">
                                {assignment.sectionName}
                            </TableCell>
                            <TableCell>
                                {assignment.roomName ? (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                                        {assignment.roomName}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground text-xs italic">
                                        No room assigned
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                {assignment.instructorName ? (
                                    <span className="flex items-center gap-1.5">
                                        <User className="text-muted-foreground h-3.5 w-3.5" />
                                        {assignment.instructorName}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground text-xs italic">
                                        No instructor
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                                    {formatDateTime(assignment.scheduledAt)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                    onClick={() => handleDelete(assignment.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
