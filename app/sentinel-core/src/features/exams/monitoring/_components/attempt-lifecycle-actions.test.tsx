import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StudentSession } from '@sentinel/shared/types';
import { AttemptLifecycleActions } from './attempt-lifecycle-actions';

const student: StudentSession = {
    id: 'student-1',
    studentRecordId: 'student-record-1',
    attemptId: 'attempt-1',
    studentNo: '2026-001',
    firstName: 'Pat',
    lastName: 'Student',
    status: 'active',
    progress: 40,
    incidentCount: 0,
    openIncidentCount: 0,
    lastActivity: 'Now',
    lifecycleState: 'IN_PROGRESS',
};

describe('AttemptLifecycleActions', () => {
    it('fires the selected lifecycle action for the student', () => {
        const onAction = vi.fn();

        render(<AttemptLifecycleActions student={student} onAction={onAction} />);

        fireEvent.click(screen.getByRole('button', { name: /Lock/i }));

        expect(onAction).toHaveBeenCalledWith(student, 'lock');
    });
});
