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
} from '@sentinel/hooks';
import { type ClassroomSummary, type Room } from '@sentinel/shared/types';
import { type User, type CreateExamSectionAssignmentPayload } from '@sentinel/services';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { type AssignmentRow } from './types';
import { RowInstructorCombobox } from './row-instructor-combobox';

export interface NewAssignmentsBuilderProps {
    examId: string;
    subjectId?: string;
    currentAssignments: any[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function NewAssignmentsBuilder({
    examId,
    subjectId,
    currentAssignments,
    onSuccess,
    onCancel,
}: NewAssignmentsBuilderProps) {
    const [rows, setRows] = React.useState<AssignmentRow[]>([
        {
            localId: Math.random().toString(),
            classroomId: 'none',
            sectionId: 'none',
            roomId: 'none',
            instructorId: 'none',
        },
    ]);

    const { data: classrooms = [], isLoading: isClassroomsLoading } = useClassroomsQuery();
    const { data: rooms = [], isLoading: isRoomsLoading } = useRoomsQuery();
    const { data: users = [], isLoading: isUsersLoading } = useUsersQuery({ role: 'instructor' });

    const filteredClassrooms = React.useMemo(() => {
        if (!subjectId) return classrooms as ClassroomSummary[];
        return (classrooms as ClassroomSummary[]).filter(
            (c) => c.subjectId === subjectId,
        );
    }, [classrooms, subjectId]);

    const createMutation = useCreateExamSectionAssignmentsBatchMutation({
        onSuccess: () => {
            toast.success('Classroom assignments saved successfully');
            setRows([
                {
                    localId: Math.random().toString(),
                    classroomId: 'none',
                    sectionId: 'none',
                    roomId: 'none',
                    instructorId: 'none',
                },
            ]);
            onSuccess?.();
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to save assignments');
        },
    });

    const activeRooms = (rooms as Room[]).filter((room: Room) => room.status !== 'MAINTENANCE');

    const handleAddRow = () => {
        setRows([
            ...rows,
            {
                localId: Math.random().toString(),
                classroomId: 'none',
                sectionId: 'none',
                roomId: 'none',
                instructorId: 'none',
            },
        ]);
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

    const assignedSectionIds = new Set(currentAssignments.map((a) => a.sectionId));
    const selectedSectionIdsInRows = rows.map((r) => r.sectionId).filter((id) => id !== 'none');

    // Check if any section is selected more than once in the builder
    const hasDuplicatesInRows = selectedSectionIdsInRows.length !== new Set(selectedSectionIdsInRows).size;

    // Check if any selected section is already assigned
    const hasConflictsWithExisting = selectedSectionIdsInRows.some((id) => assignedSectionIds.has(id));

    const isPending = createMutation.isPending;
    const isValid =
        selectedSectionIdsInRows.length > 0 &&
        !hasDuplicatesInRows &&
        !hasConflictsWithExisting &&
        rows.every((row) => row.classroomId !== 'none');

    const handleSubmit = async () => {
        if (!isValid) return;

        const payload = {
            assignments: rows.map((row) => {
                const item: CreateExamSectionAssignmentPayload = {
                    sectionId: row.sectionId,
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
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                        {hasDuplicatesInRows && 'Duplicate classroom selections detected. '}
                        {hasConflictsWithExisting && 'Some selected classrooms (sections) are already assigned.'}
                    </span>
                </div>
            )}

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                    {rows.map((row) => (
                        <motion.div
                            key={row.localId}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 border rounded-lg bg-zinc-50/50 dark:bg-zinc-950/20 pr-12"
                        >
                            {/* Classroom Select */}
                            <div className="space-y-1.5 md:col-span-5">
                                <Label className="text-xs font-semibold text-zinc-500">
                                    Classroom (Required)
                                </Label>
                                {isClassroomsLoading ? (
                                    <div className="h-10 border rounded-md flex items-center px-3 bg-white dark:bg-zinc-950">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1.5 text-zinc-500" />
                                        <span className="text-xs text-zinc-500">Loading...</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={row.classroomId}
                                        onValueChange={(val) =>
                                            handleClassroomChange(row.localId, val)
                                        }
                                        disabled={isPending}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-zinc-950">
                                            <SelectValue placeholder="Select classroom" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none" disabled>
                                                Select classroom
                                            </SelectItem>
                                            {filteredClassrooms.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id}>
                                                    {cls.className || cls.scopeSummary.sectionLabel}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Room Select */}
                            <div className="space-y-1.5 md:col-span-3">
                                <Label className="text-xs font-semibold text-zinc-500">
                                    Room (Optional)
                                </Label>
                                {isRoomsLoading ? (
                                    <div className="h-10 border rounded-md flex items-center px-3 bg-white dark:bg-zinc-950">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1.5 text-zinc-500" />
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
                                                    <div className="flex items-center justify-between w-full gap-2">
                                                        <span>
                                                            {room.name} ({room.room_number})
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'ml-2 rounded-xs border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
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
                                    <div className="h-10 border rounded-md flex items-center px-3 bg-white dark:bg-zinc-950">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1.5 text-zinc-500" />
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
                            <div className="md:col-span-1 flex justify-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 h-10 w-10 flex items-center justify-center"
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

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between border-t mt-4">
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

                <div className="flex gap-2 w-full sm:w-auto">
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
                        className="w-full sm:w-auto bg-[#323d8f] text-white hover:bg-[#323d8f]/90 font-semibold"
                    >
                        {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Save Assignments
                    </Button>
                </div>
            </div>
        </div>
    );
}
