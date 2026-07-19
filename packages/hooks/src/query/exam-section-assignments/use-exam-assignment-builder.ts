import { useState, useMemo, useCallback } from 'react';

export interface AssignmentRow {
    localId: string;
    classroomId: string;
    sectionId: string;
    roomId: string;
    instructorId: string;
}

export interface AssignmentRowErrors {
    classroomId?: string;
    roomId?: string;
    instructorId?: string;
}

export interface UseExamAssignmentBuilderArgs {
    currentAssignments: { classGroupId?: string | null; sectionId: string | null }[];
    classrooms: { id: string; sectionId: string | null }[];
}

let rowCounter = 0;
function generateRowId(): string {
    rowCounter += 1;
    return `assignment-row-${rowCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * A custom hook to manage the state and validation of the batch exam instructor/classroom assignment dialog.
 */
export function useExamAssignmentBuilder({
    currentAssignments,
    classrooms,
}: UseExamAssignmentBuilderArgs) {
    const [rows, setRows] = useState<AssignmentRow[]>(() => [
        {
            localId: generateRowId(),
            classroomId: 'none',
            sectionId: 'none',
            roomId: 'none',
            instructorId: 'none',
        },
    ]);
    const [bulkInstructorId, setBulkInstructorId] = useState<string>('none');
    const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

    // 1. Core operations
    const addRow = useCallback(() => {
        setRows((prev) => [
            ...prev,
            {
                localId: generateRowId(),
                classroomId: 'none',
                sectionId: 'none',
                roomId: 'none',
                instructorId: bulkInstructorId !== 'none' ? bulkInstructorId : 'none',
            },
        ]);
    }, [bulkInstructorId]);

    const removeRow = useCallback((localId: string) => {
        setRows((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((r) => r.localId !== localId);
        });
    }, []);

    const updateRowField = useCallback((
        localId: string,
        field: keyof AssignmentRow,
        value: string
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.localId !== localId) return row;
                if (field === 'classroomId') {
                    const matchedClassroom = classrooms.find((c) => c.id === value);
                    return {
                        ...row,
                        classroomId: value,
                        sectionId: matchedClassroom?.sectionId || 'none',
                    };
                }
                return { ...row, [field]: value };
            })
        );
    }, [classrooms]);

    const updateBulkInstructor = useCallback((instructorId: string) => {
        setBulkInstructorId(instructorId);
        setRows((prev) =>
            prev.map((row) => ({
                ...row,
                instructorId: instructorId !== 'none' ? instructorId : row.instructorId,
            }))
        );
    }, []);

    const resetBuilder = useCallback(() => {
        setRows([
            {
                localId: generateRowId(),
                classroomId: 'none',
                sectionId: 'none',
                roomId: 'none',
                instructorId: 'none',
            },
        ]);
        setBulkInstructorId('none');
        setSubmitAttempted(false);
    }, []);

    // 2. Validation & Conflicts
    const errors = useMemo(() => {
        const errMap: Record<string, AssignmentRowErrors> = {};
        rows.forEach((row) => {
            const rowErrs: AssignmentRowErrors = {};
            if (row.classroomId === 'none') {
                rowErrs.classroomId = 'Classroom is required.';
            }
            if (row.roomId === 'none') {
                rowErrs.roomId = 'Room is required.';
            }
            if (row.instructorId === 'none') {
                rowErrs.instructorId = 'Instructor is required.';
            }
            errMap[row.localId] = rowErrs;
        });
        return errMap;
    }, [rows]);

    const hasErrors = useMemo(() => {
        return Object.values(errors).some((e) => Object.keys(e).length > 0);
    }, [errors]);

    const readinessCount = useMemo(() => {
        return rows.filter((row) => {
            const rowErrs = errors[row.localId];
            return Object.keys(rowErrs).length === 0;
        }).length;
    }, [rows, errors]);

    // Check row duplicates (classroom or section)
    const selectedClassroomIds = useMemo(() => {
        return rows.map((r) => r.classroomId).filter((id) => id !== 'none');
    }, [rows]);

    const selectedSectionIds = useMemo(() => {
        return rows.map((r) => r.sectionId).filter((id) => id !== 'none');
    }, [rows]);

    const hasDuplicateClassroomsInRows = useMemo(() => {
        return selectedClassroomIds.length !== new Set(selectedClassroomIds).size;
    }, [selectedClassroomIds]);

    const hasDuplicateSectionsInRows = useMemo(() => {
        return selectedSectionIds.length !== new Set(selectedSectionIds).size;
    }, [selectedSectionIds]);

    const hasDuplicatesInRows = hasDuplicateClassroomsInRows || hasDuplicateSectionsInRows;

    // Check conflicts with existing database assignments
    const assignedClassroomIds = useMemo(() => {
        return new Set(
            currentAssignments
                .map((a) => a.classGroupId)
                .filter((id): id is string => Boolean(id))
        );
    }, [currentAssignments]);

    const assignedSectionIds = useMemo(() => {
        return new Set(
            currentAssignments
                .filter((a) => !a.classGroupId)
                .map((a) => a.sectionId)
                .filter((id): id is string => Boolean(id))
        );
    }, [currentAssignments]);

    const hasConflictsWithExisting = useMemo(() => {
        return rows.some((row) => {
            if (row.classroomId !== 'none' && assignedClassroomIds.has(row.classroomId)) {
                return true;
            }
            if (row.sectionId !== 'none' && assignedSectionIds.has(row.sectionId)) {
                return true;
            }
            return false;
        });
    }, [rows, assignedClassroomIds, assignedSectionIds]);

    // 3. Focus management helper
    const firstInvalidField = useMemo(() => {
        if (!submitAttempted) return null;
        for (const row of rows) {
            const rowErrs = errors[row.localId];
            if (rowErrs.classroomId) return { localId: row.localId, field: 'classroomId' as const };
            if (rowErrs.roomId) return { localId: row.localId, field: 'roomId' as const };
            if (rowErrs.instructorId) return { localId: row.localId, field: 'instructorId' as const };
        }
        return null;
    }, [rows, errors, submitAttempted]);

    // 4. Payload builder
    const buildPayload = useCallback(() => {
        if (hasErrors || hasDuplicatesInRows || hasConflictsWithExisting) {
            return null;
        }

        const assignments = rows.map((row) => ({
            sectionId: row.sectionId,
            classGroupId: row.classroomId,
            roomId: row.roomId,
            instructorId: row.instructorId,
        }));

        return { assignments };
    }, [rows, hasErrors, hasDuplicatesInRows, hasConflictsWithExisting]);

    return {
        rows,
        bulkInstructorId,
        submitAttempted,
        setSubmitAttempted,
        addRow,
        removeRow,
        updateRowField,
        updateBulkInstructor,
        resetBuilder,
        errors,
        hasErrors,
        readinessCount,
        totalCount: rows.length,
        hasDuplicatesInRows,
        hasConflictsWithExisting,
        firstInvalidField,
        buildPayload,
    };
}
