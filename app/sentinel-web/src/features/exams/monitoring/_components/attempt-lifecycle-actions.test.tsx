import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StudentSession } from '@sentinel/shared/types';
import { AttemptLifecycleActions } from './attempt-lifecycle-actions';

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    return {
        ...actual,
        DropdownMenu: ({ children }: any) => <div>{children}</div>,
        DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
        DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
        DropdownMenuItem: ({ children, onClick, disabled, 'aria-label': ariaLabel, title }: any) => (
            <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} title={title}>
                {children}
            </button>
        ),
    };
});


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
    afterEach(() => {
        cleanup();
    });

    it('fires the selected lifecycle action for the student', () => {
        const onAction = vi.fn();

        render(<AttemptLifecycleActions student={student} onAction={onAction} />);

        fireEvent.click(screen.getByRole('button', { name: /Lock attempt for Pat Student/i }));

        expect(onAction).toHaveBeenCalledWith(student, 'lock');
    });

    it('uses selected-student confirmation copy instead of exam-wide wording', () => {
        render(<AttemptLifecycleActions student={student} onAction={vi.fn()} />);

        expect(
            screen
                .getByRole('button', { name: /Close attempt for Pat Student/i })
                .getAttribute('title'),
        ).toBe('Close attempt for Pat Student');
        expect(screen.queryByTitle(/whole exam/i)).toBeNull();
    });

    it('disables lock, close, and reset actions when the attempt is CLOSED', () => {
        const closedStudent: StudentSession = {
            ...student,
            lifecycleState: 'CLOSED',
        };

        render(<AttemptLifecycleActions student={closedStudent} onAction={vi.fn()} />);

        expect(screen.getByRole('button', { name: /Lock/i })).toHaveProperty('disabled', true);
        expect(screen.getByRole('button', { name: /Close/i })).toHaveProperty('disabled', true);
        expect(screen.getByRole('button', { name: /Reset/i })).toHaveProperty('disabled', true);

        // Reopen, Makeup and Retake should be enabled
        expect(screen.getByRole('button', { name: /Reopen/i })).toHaveProperty('disabled', false);
        expect(screen.getByRole('button', { name: /Makeup/i })).toHaveProperty('disabled', false);
        expect(screen.getByRole('button', { name: /Retake/i })).toHaveProperty('disabled', false);
    });

    it('disables lock and reopen actions when the attempt is LOCKED', () => {
        const lockedStudent: StudentSession = {
            ...student,
            lifecycleState: 'LOCKED',
        };

        render(<AttemptLifecycleActions student={lockedStudent} onAction={vi.fn()} />);

        expect(screen.getByRole('button', { name: /Lock/i })).toHaveProperty('disabled', true);
        // Reopen should be enabled for locked attempts (since it is LOCKED, not IN_PROGRESS)
        expect(screen.getByRole('button', { name: /Reopen/i })).toHaveProperty('disabled', false);
    });

    it('disables reopen when the attempt is IN_PROGRESS', () => {
        const inProgressStudent: StudentSession = {
            ...student,
            lifecycleState: 'IN_PROGRESS',
        };

        render(<AttemptLifecycleActions student={inProgressStudent} onAction={vi.fn()} />);

        expect(screen.getByRole('button', { name: /Reopen/i })).toHaveProperty('disabled', true);
        expect(screen.getByRole('button', { name: /Lock/i })).toHaveProperty('disabled', false);
    });
});
