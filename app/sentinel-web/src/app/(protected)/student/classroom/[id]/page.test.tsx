import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentClassroomDetailPage from './page';

vi.mock('@sentinel/hooks', () => ({
    useStudentClassroomsQuery: vi.fn(),
    useExamsQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useParams: () => ({ id: 'classroom-1' }),
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
}));

vi.mock('../../exam/_components/exam-card', () => ({
    ExamCard: ({ exam }: { exam: { title: string; status: string } }) => (
        <div data-testid="exam-card">
            <span>{exam.title}</span>
            <span>{exam.status}</span>
        </div>
    ),
}));

import { useStudentClassroomsQuery, useExamsQuery } from '@sentinel/hooks';

describe('StudentClassroomDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows only active classroom assessments', () => {
        vi.mocked(useStudentClassroomsQuery).mockReturnValue({
            data: [
                {
                    id: 'classroom-1',
                    subjectCode: 'GEETH01X',
                    sectionName: 'INF232',
                    subjectTitle: 'ETHICS',
                    instructors: ['Keanna Mae Cloma'],
                    term: 'AY 2025-2026 1st Semester',
                },
            ],
            isLoading: false,
        } as any);
        vi.mocked(useExamsQuery).mockReturnValue({
            data: [
                {
                    id: 'exam-available',
                    title: 'Available Exam',
                    status: 'available',
                },
                {
                    id: 'exam-upcoming',
                    title: 'Upcoming Exam',
                    status: 'upcoming',
                },
                {
                    id: 'exam-archived',
                    title: 'Archived Exam',
                    status: 'archived',
                },
            ],
            isLoading: false,
        } as any);

        render(<StudentClassroomDetailPage />);

        expect(screen.getByText('Available Exam')).toBeTruthy();
        expect(screen.getByText('Upcoming Exam')).toBeTruthy();
        expect(screen.queryByText('Archived Exam')).toBeNull();
    });

    it('shows the active empty state when only archived assessments exist', () => {
        vi.mocked(useStudentClassroomsQuery).mockReturnValue({
            data: [
                {
                    id: 'classroom-1',
                    subjectCode: 'GEETH01X',
                    sectionName: 'INF232',
                    subjectTitle: 'ETHICS',
                    instructors: ['Keanna Mae Cloma'],
                    term: 'AY 2025-2026 1st Semester',
                },
            ],
            isLoading: false,
        } as any);
        vi.mocked(useExamsQuery).mockReturnValue({
            data: [
                {
                    id: 'exam-archived',
                    title: 'Archived Exam',
                    status: 'archived',
                },
            ],
            isLoading: false,
        } as any);

        render(<StudentClassroomDetailPage />);

        expect(screen.getByText('No assessments found')).toBeTruthy();
        expect(
            screen.getByText('There are no active assessments assigned to this classroom right now.'),
        ).toBeTruthy();
    });

    it('keeps published classroom assessments visible after student status normalization', () => {
        vi.mocked(useStudentClassroomsQuery).mockReturnValue({
            data: [
                {
                    id: 'classroom-1',
                    subjectCode: 'GEETH01X',
                    sectionName: 'INF232',
                    subjectTitle: 'ETHICS',
                    instructors: ['Keanna Mae Cloma'],
                    term: 'AY 2025-2026 1st Semester',
                },
            ],
            isLoading: false,
        } as any);
        vi.mocked(useExamsQuery).mockReturnValue({
            data: [
                {
                    id: 'exam-published',
                    title: 'Published Exam',
                    status: 'published',
                    scheduledDate: '2099-06-24T09:00:00Z',
                    endDateTime: '2099-06-24T11:00:00Z',
                    duration: 60,
                },
            ],
            isLoading: false,
        } as any);

        render(<StudentClassroomDetailPage />);

        expect(screen.getByText('Published Exam')).toBeTruthy();
        expect(screen.getAllByText('upcoming').length).toBeGreaterThan(0);
    });
});
