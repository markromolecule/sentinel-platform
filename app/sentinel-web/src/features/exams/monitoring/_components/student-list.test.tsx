import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StudentSession } from '@sentinel/shared/types';
import { StudentList } from './student-list';

vi.mock('./student-card', () => ({
    StudentCard: ({ student, onClick }: { student: StudentSession; onClick: () => void }) => (
        <button type="button" onClick={onClick}>
            {student.firstName} {student.lastName}
        </button>
    ),
}));

function createStudent(overrides: Partial<StudentSession>): StudentSession {
    return {
        id: overrides.id ?? 'student-1',
        attemptId: overrides.attemptId ?? 'attempt-1',
        studentNo: overrides.studentNo ?? '2026-001',
        firstName: overrides.firstName ?? 'Pat',
        lastName: overrides.lastName ?? 'Student',
        status: overrides.status ?? 'active',
        progress: overrides.progress ?? 0,
        incidentCount: overrides.incidentCount ?? 0,
        openIncidentCount: overrides.openIncidentCount ?? 0,
        lastActivity: overrides.lastActivity ?? 'Now',
        lifecycleState: overrides.lifecycleState ?? 'IN_PROGRESS',
    };
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('StudentList', () => {
    it('renders the empty-search state when there are no visible students', () => {
        render(
            <StudentList
                students={[]}
                selectedId={null}
                onSelect={vi.fn()}
                searchQuery="pat"
                onSearchChange={vi.fn()}
                filterStatus="all"
                onFilterChange={vi.fn()}
            />,
        );

        expect(
            screen.getByText('No students match the current search or status filter.'),
        ).toBeTruthy();
    });

    it('keeps pagination labels correct for filtered student totals', () => {
        render(
            <StudentList
                students={[
                    createStudent({ id: 'student-1', firstName: 'Pat' }),
                    createStudent({ id: 'student-2', firstName: 'Alex' }),
                    createStudent({ id: 'student-3', firstName: 'Casey' }),
                ]}
                selectedId={null}
                onSelect={vi.fn()}
                searchQuery=""
                onSearchChange={vi.fn()}
                filterStatus="all"
                onFilterChange={vi.fn()}
                page={1}
                pageSize={2}
                totalCount={3}
                onPageChange={vi.fn()}
            />,
        );

        expect(
            screen.getByText(
                (_, element) => element?.textContent === 'Showing 1 to 2 of 3 students',
            ),
        ).toBeTruthy();
    });

    it('still renders lifecycle-aware students in the list', () => {
        render(
            <StudentList
                students={[
                    createStudent({ id: 'student-1', firstName: 'Pat', lifecycleState: 'CLOSED' }),
                ]}
                selectedId={null}
                onSelect={vi.fn()}
                searchQuery=""
                onSearchChange={vi.fn()}
                filterStatus="all"
                onFilterChange={vi.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: 'Pat Student' })).toBeTruthy();
    });
});
