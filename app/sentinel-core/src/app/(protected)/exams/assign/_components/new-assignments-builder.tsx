'use client';

import * as React from 'react';
import {
    Button,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn,
} from '@sentinel/ui';
import {
    useClassroomsQuery,
    useRoomsQuery,
    useUsersQuery,
    useCreateExamSectionAssignmentsBatchMutation,
    useProfileQuery,
} from '@sentinel/hooks';
import { type ClassroomSummary, type Room } from '@sentinel/shared/types';
import {
    type User,
    type CreateExamSectionAssignmentPayload,
    type ExamSectionAssignmentRecord,
} from '@sentinel/services';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { type AssignmentRow } from './types';
import { RowInstructorCombobox } from './row-instructor-combobox';
import { RowClassroomCombobox } from './row-classroom-combobox';

let assignmentRowSequence = 0;

function createAssignmentRow(): AssignmentRow {
    assignmentRowSequence += 1;

    return {
        localId: `assignment-row-${assignmentRowSequence}`,
        classroomId: 'none',
        sectionId: 'none',
        roomId: 'none',
        instructorId: 'none',
    };
}

export interface NewAssignmentsBuilderProps {
    examId: string;
    subjectId?: string;
    currentAssignments: ExamSectionAssignmentRecord[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

/**
 * NewAssignmentsBuilder renders a multi-row assignment editor for section, room, and instructor.
 */
export function NewAssignmentsBuilder({
    examId,
    subjectId,
    currentAssignments,
    onSuccess,
    onCancel,
}: NewAssignmentsBuilderProps) {
    const { profile } = useProfileQuery();
    const [rows, setRows] = React.useState<AssignmentRow[]>(() => [createAssignmentRow()]);

    const { data: classrooms = [], isLoading: isClassroomsLoading } = useClassroomsQuery({
        institutionId: profile?.institutionId || undefined,
        subjectId: subjectId || undefined,
    });
    const { data: rooms = [], isLoading: isRoomsLoading } = useRoomsQuery();
    const { data: users = [], isLoading: isUsersLoading } = useUsersQuery({ role: 'instructor' });

    const filteredClassrooms = React.useMemo(() => {
        const subjectMatchedClassrooms = !subjectId
            ? []
            : (classrooms as ClassroomSummary[]).filter(
                  (classroom) => classroom.subjectId === subjectId,
              );

        if (subjectMatchedClassrooms.length > 0) {
            return subjectMatchedClassrooms;
        }

        return classrooms as ClassroomSummary[];
    }, [classrooms, subjectId]);

    const createMutation = useCreateExamSectionAssignmentsBatchMutation({
        onSuccess: () => {
            toast.success('Classroom assignments saved successfully');
            setRows([createAssignmentRow()]);
            onSuccess?.();
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to save assignments');
        },
    });

    const activeRooms = (rooms as Room[]).filter((room: Room) => room.status !== 'MAINTENANCE');

    const handleAddRow = () => {
        setRows([...rows, createAssignmentRow()]);
    };

    const handleRemoveRow = (localId: string) => {
        if (rows.length === 1) return;
        setRows(rows.filter((row) => row.localId !== localId));
    };

    const handleClassroomChange = (localId: string, classroomId: string) => {
        const classroom = (classrooms as ClassroomSummary[]).find((c) => c.id === classroomId);
        setRows(
            rows.map((row) => {
                if (row.localId === localId) {
                    return {
                        ...row,
                        classroomId,
                        sectionId: classroom?.sectionId || 'none',
                    };
                }
                return row;
            }),
        );
    };

    const handleFieldChange = (
        localId: string,
        field: keyof Omit<AssignmentRow, 'classroomId' | 'sectionId'>,
        value: string,
    ) => {
        setRows(
            rows.map((row) => {
                if (row.localId === localId) {
                    return { ...row, [field]: value };
                }
                return row;
            }),
        );
    };

    const assignedSectionIds = new Set(
        currentAssignments
            .filter((assignment) => !assignment.classGroupId)
            .map((assignment) => assignment.sectionId),
    );
    const assignedClassroomIds = new Set(
        currentAssignments
            .map((assignment) => assignment.classGroupId)
            .filter((id): id is string => Boolean(id)),
    );
    const selectedSectionIdsInRows = rows.map((row) => row.sectionId).filter((id) => id !== 'none');
    const selectedClassroomIdsInRows = rows
        .map((row) => row.classroomId)
        .filter((id) => id !== 'none');

    const hasDuplicateClassroomsInRows =
        selectedClassroomIdsInRows.length !== new Set(selectedClassroomIdsInRows).size;
    const hasDuplicateLegacySectionsInRows =
        selectedSectionIdsInRows.length !== new Set(selectedSectionIdsInRows).size;
    const hasDuplicatesInRows = hasDuplicateClassroomsInRows || hasDuplicateLegacySectionsInRows;
    const hasConflictsWithExisting = rows.some((row) => {
        if (row.classroomId !== 'none' && assignedClassroomIds.has(row.classroomId)) {
            return true;
        }

        return row.sectionId !== 'none' && assignedSectionIds.has(row.sectionId);
    });

    const isPending = createMutation.isPending;
    const isValid =
        selectedSectionIdsInRows.length > 0 &&
        !hasDuplicatesInRows &&
        !hasConflictsWithExisting &&
        filteredClassrooms.length > 0 &&
        rows.every((row) => row.classroomId !== 'none');

    const handleSubmit = async () => {
        if (!isValid) return;

        const payload = {
            assignments: rows.map((row) => {
                const item: CreateExamSectionAssignmentPayload = {
                    sectionId: row.sectionId,
                    classGroupId: row.classroomId,
                };

                if (row.roomId !== 'none') {
                    item.roomId = row.roomId;
                }

                if (row.instructorId !== 'none') {
                    item.instructorId = row.instructorId;
                }

                return item;
            }),
        };

        await createMutation.mutateAsync({
            examId,
            payload,
        });
    };

    return (
        <div className="space-y-4">
            {(hasDuplicatesInRows || hasConflictsWithExisting) && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                        {hasDuplicatesInRows && 'Duplicate classroom selections detected. '}
                        {hasConflictsWithExisting &&
                            'Some selected classrooms (sections) are already assigned.'}
                    </span>
                </div>
            )}

            <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                    {rows.map((row) => (
                        <motion.div
                            key={row.localId}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative grid grid-cols-1 items-end gap-3 rounded-lg border bg-zinc-50/50 p-4 pr-12 md:grid-cols-12 dark:bg-zinc-950/20"
                        >
                            {/* Classroom Select */}
                            <div className="space-y-1.5 md:col-span-5">
                                <Label className="text-xs font-semibold text-zinc-500">
                                    Classroom (Required)
                                </Label>
                                {isClassroomsLoading ? (
                                    <div className="flex h-10 items-center rounded-md border bg-white px-3 dark:bg-zinc-950">
                                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin text-zinc-500" />
                                        <span className="text-xs text-zinc-500">Loading...</span>
                                    </div>
                                ) : (
                                    <RowClassroomCombobox
                                        value={row.classroomId}
                                        onValueChange={(val) =>
                                            handleClassroomChange(row.localId, val)
                                        }
                                        classrooms={filteredClassrooms}
                                        disabled={isPending}
                                    />
                                )}
                            </div>

                            {/* Room Select */}
                            <div className="space-y-1.5 md:col-span-3">
                                <Label className="text-xs font-semibold text-zinc-500">
                                    Room (Optional)
                                </Label>
                                {isRoomsLoading ? (
                                    <div className="flex h-10 items-center rounded-md border bg-white px-3 dark:bg-zinc-950">
                                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin text-zinc-500" />
                                        <span className="text-xs text-zinc-500">Loading...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={row.roomId}
                                        onValueChange={(val) =>
                                            handleFieldChange(row.localId, 'roomId', val)
                                        }
                                        disabled={isPending}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-zinc-950">
                                            <SelectValue placeholder="No room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No room</SelectItem>
                                            {activeRooms.map((room) => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    <div className="flex w-full items-center justify-between gap-2">
                                                        <span>
                                                            {room.name} ({room.room_number})
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'ml-2 rounded-xs border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
                                                                room.status === 'AVAILABLE'
                                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400',
                                                            )}
                                                        >
                                                            {room.status === 'AVAILABLE'
                                                                ? 'Available'
                                                                : 'Assigned'}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Instructor Select */}
                            <div className="space-y-1.5 md:col-span-3">
                                <Label className="text-xs font-semibold text-zinc-500">
                                    Instructor (Optional)
                                </Label>
                                {isUsersLoading ? (
                                    <div className="flex h-10 items-center rounded-md border bg-white px-3 dark:bg-zinc-950">
                                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin text-zinc-500" />
                                        <span className="text-xs text-zinc-500">Loading...</span>
                                    </div>
                                ) : (
                                    <RowInstructorCombobox
                                        value={row.instructorId}
                                        onValueChange={(val) =>
                                            handleFieldChange(row.localId, 'instructorId', val)
                                        }
                                        users={users as User[]}
                                        disabled={isPending}
                                    />
                                )}
                            </div>

                            {/* Remove Button */}
                            <div className="flex justify-center md:col-span-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="flex h-10 w-10 items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                    onClick={() => handleRemoveRow(row.localId)}
                                    disabled={rows.length === 1 || isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Classroom Row
                </Button>

                <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={isPending}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!isValid || isPending}
                        className="w-full bg-[#323d8f] font-semibold text-white hover:bg-[#323d8f]/90 sm:w-auto"
                    >
                        {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Save Assignments
                    </Button>
                </div>
            </div>
        </div>
    );
}
