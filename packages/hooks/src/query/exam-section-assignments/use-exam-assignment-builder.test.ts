import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExamAssignmentBuilder } from './use-exam-assignment-builder';

describe('useExamAssignmentBuilder', () => {
    const mockClassrooms = [
        { id: 'class-1', sectionId: 'sect-1' },
        { id: 'class-2', sectionId: 'sect-2' },
        { id: 'class-3', sectionId: 'sect-3' },
    ];
    const mockCurrentAssignments = [{ classGroupId: 'class-3', sectionId: 'sect-3' }];

    it('initializes with a single empty row and default bulk instructor', () => {
        const { result } = renderHook(() =>
            useExamAssignmentBuilder({
                classrooms: mockClassrooms,
                currentAssignments: [],
            }),
        );

        expect(result.current.rows).toHaveLength(1);
        expect(result.current.rows[0].classroomId).toBe('none');
        expect(result.current.bulkInstructorId).toBe('none');
        expect(result.current.submitAttempted).toBe(false);
        expect(result.current.readinessCount).toBe(0);
        expect(result.current.hasErrors).toBe(true);
    });

    it('applies bulk instructor to all existing rows and newly created rows', () => {
        const { result } = renderHook(() =>
            useExamAssignmentBuilder({
                classrooms: mockClassrooms,
                currentAssignments: [],
            }),
        );

        // Add a second row first
        act(() => {
            result.current.addRow();
        });
        expect(result.current.rows).toHaveLength(2);
        expect(result.current.rows[0].instructorId).toBe('none');
        expect(result.current.rows[1].instructorId).toBe('none');

        // Apply bulk instructor
        act(() => {
            result.current.updateBulkInstructor('inst-bulk');
        });
        expect(result.current.bulkInstructorId).toBe('inst-bulk');
        expect(result.current.rows[0].instructorId).toBe('inst-bulk');
        expect(result.current.rows[1].instructorId).toBe('inst-bulk');

        // Add a third row - should inherit bulk instructor
        act(() => {
            result.current.addRow();
        });
        expect(result.current.rows).toHaveLength(3);
        expect(result.current.rows[2].instructorId).toBe('inst-bulk');
    });

    it('supports individual row override of instructor after bulk assignment', () => {
        const { result } = renderHook(() =>
            useExamAssignmentBuilder({
                classrooms: mockClassrooms,
                currentAssignments: [],
            }),
        );

        act(() => {
            result.current.updateBulkInstructor('inst-bulk');
        });

        // Override second row's instructor
        act(() => {
            result.current.updateRowField(
                result.current.rows[0].localId,
                'instructorId',
                'inst-override',
            );
        });

        expect(result.current.rows[0].instructorId).toBe('inst-override');
    });

    it('detects duplicate classrooms selected across rows', () => {
        const { result } = renderHook(() =>
            useExamAssignmentBuilder({
                classrooms: mockClassrooms,
                currentAssignments: [],
            }),
        );

        act(() => {
            result.current.updateRowField(result.current.rows[0].localId, 'classroomId', 'class-1');
        });

        act(() => {
            result.current.addRow();
        });

        act(() => {
            result.current.updateRowField(result.current.rows[1].localId, 'classroomId', 'class-1'); // Duplicate
        });

        expect(result.current.hasDuplicatesInRows).toBe(true);
    });

    it('detects conflicts with existing database assignments', () => {
        const { result } = renderHook(() =>
            useExamAssignmentBuilder({
                classrooms: mockClassrooms,
                currentAssignments: mockCurrentAssignments, // class-3 is already assigned
            }),
        );

        act(() => {
            result.current.updateRowField(result.current.rows[0].localId, 'classroomId', 'class-3');
        });

        expect(result.current.hasConflictsWithExisting).toBe(true);
    });

    it('manages submit attempt and first invalid field tracking', () => {
        const { result } = renderHook(() =>
            useExamAssignmentBuilder({
                classrooms: mockClassrooms,
                currentAssignments: [],
            }),
        );

        expect(result.current.firstInvalidField).toBeNull();

        act(() => {
            result.current.setSubmitAttempted(true);
        });

        // First field missing is classroomId
        expect(result.current.firstInvalidField).toEqual({
            localId: result.current.rows[0].localId,
            field: 'classroomId',
        });

        // Resolve classroom
        act(() => {
            result.current.updateRowField(result.current.rows[0].localId, 'classroomId', 'class-1');
        });

        // Next field missing is roomId
        expect(result.current.firstInvalidField).toEqual({
            localId: result.current.rows[0].localId,
            field: 'roomId',
        });
    });

    it('builds a valid payload only when all validations pass', () => {
        const { result } = renderHook(() =>
            useExamAssignmentBuilder({
                classrooms: mockClassrooms,
                currentAssignments: [],
            }),
        );

        // Initially invalid, returns null
        expect(result.current.buildPayload()).toBeNull();

        // Populate all fields
        act(() => {
            result.current.updateRowField(result.current.rows[0].localId, 'classroomId', 'class-1');
            result.current.updateRowField(result.current.rows[0].localId, 'roomId', 'room-abc');
            result.current.updateRowField(
                result.current.rows[0].localId,
                'instructorId',
                'inst-xyz',
            );
        });

        expect(result.current.readinessCount).toBe(1);
        expect(result.current.hasErrors).toBe(false);

        const payload = result.current.buildPayload();
        expect(payload).toEqual({
            assignments: [
                {
                    sectionId: 'sect-1',
                    classGroupId: 'class-1',
                    roomId: 'room-abc',
                    instructorId: 'inst-xyz',
                },
            ],
        });
    });

    it('resets the form correctly to initial state', () => {
        const { result } = renderHook(() =>
            useExamAssignmentBuilder({
                classrooms: mockClassrooms,
                currentAssignments: [],
            }),
        );

        act(() => {
            result.current.updateRowField(result.current.rows[0].localId, 'classroomId', 'class-1');
            result.current.updateBulkInstructor('inst-bulk');
            result.current.setSubmitAttempted(true);
        });

        act(() => {
            result.current.resetBuilder();
        });

        expect(result.current.rows).toHaveLength(1);
        expect(result.current.rows[0].classroomId).toBe('none');
        expect(result.current.bulkInstructorId).toBe('none');
        expect(result.current.submitAttempted).toBe(false);
    });
});
