import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassroomView } from './classroom-view';

vi.mock('@sentinel/hooks', () => ({
    useStudentClassroomsQuery: vi.fn(),
}));

vi.mock('../../exam/_components/exam-header', () => ({
    ExamHeader: () => <div>Exam Header</div>,
}));

import { useStudentClassroomsQuery } from '@sentinel/hooks';

describe('ClassroomView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the active classrooms returned by the student classrooms query', () => {
        vi.mocked(useStudentClassroomsQuery).mockReturnValue({
            data: [
                {
                    id: 'classroom-1',
                    subjectTitle: 'ETHICS',
                    subjectCode: 'GEETH01X',
                    sectionName: 'INF232',
                    instructors: ['Keanna Mae Cloma'],
                    term: 'AY 2026-2027 1st Semester',
                },
                {
                    id: 'classroom-2',
                    subjectTitle: 'SCIENCE, TECHNOLOGY AND SOCIETY',
                    subjectCode: 'GESTS01X',
                    sectionName: 'INF232',
                    instructors: ['Michael Galo'],
                    term: 'AY 2026-2027 1st Semester',
                },
            ],
            isLoading: false,
            error: null,
        } as any);

        render(<ClassroomView />);

        expect(screen.getByText('ETHICS')).toBeTruthy();
        expect(screen.getByText('SCIENCE, TECHNOLOGY AND SOCIETY')).toBeTruthy();
    });

    it('shows the empty state when no active classrooms are returned', () => {
        vi.mocked(useStudentClassroomsQuery).mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        } as any);

        render(<ClassroomView />);

        expect(screen.getByText("You don't have any classrooms yet.")).toBeTruthy();
    });
});
