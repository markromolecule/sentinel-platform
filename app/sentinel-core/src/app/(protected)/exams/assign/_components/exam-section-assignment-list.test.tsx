import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamSectionAssignmentList } from './exam-section-assignment-list';
import { useDeleteExamSectionAssignmentMutation } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useDeleteExamSectionAssignmentMutation: vi.fn(),
}));

describe('ExamSectionAssignmentList', () => {
    const mockMutate = vi.fn();
    const mockOnAssignClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
        vi.mocked(useDeleteExamSectionAssignmentMutation).mockReturnValue({
            mutateAsync: mockMutate,
            isPending: false,
        } as unknown as ReturnType<typeof useDeleteExamSectionAssignmentMutation>);
        // Mock global confirm function to auto-approve deletion
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    const mockAssignments = [
        {
            id: 'assignment-1',
            examId: 'exam-1',
            sectionId: 'section-1',
            sectionName: 'Section Alpha',
            roomId: 'room-1',
            roomName: 'Room 101',
            instructorId: 'instructor-1',
            instructorName: 'Dr. Smith',
            scheduledAt: '2026-06-15T09:00:00.000Z',
            createdAt: '2026-06-13T12:00:00.000Z',
            updatedAt: '2026-06-13T12:00:00.000Z',
        },
    ];

    it('renders the assignments list with correct data', () => {
        render(
            <ExamSectionAssignmentList
                examId="exam-1"
                assignments={mockAssignments}
                isLoading={false}
                onAssignClick={mockOnAssignClick}
            />,
        );

        expect(screen.getByText('Section Alpha')).toBeDefined();
        expect(screen.getByText('Room 101')).toBeDefined();
        expect(screen.getByText('Dr. Smith')).toBeDefined();
    });

    it('renders the empty state and responds to assign click', () => {
        render(
            <ExamSectionAssignmentList
                examId="exam-1"
                assignments={[]}
                isLoading={false}
                onAssignClick={mockOnAssignClick}
            />,
        );

        expect(screen.getByText('No Sections Assigned')).toBeDefined();
        const assignBtn = screen.getByRole('button', { name: 'Assign Section' });
        fireEvent.click(assignBtn);
        expect(mockOnAssignClick).toHaveBeenCalled();
    });

    it('triggers the delete mutation when delete action is clicked', () => {
        render(
            <ExamSectionAssignmentList
                examId="exam-1"
                assignments={mockAssignments}
                isLoading={false}
                onAssignClick={mockOnAssignClick}
            />,
        );

        // Find the delete button
        const deleteButtons = screen.getAllByRole('button');
        const deleteBtn = deleteButtons.find((btn) => btn.querySelector('svg'));
        expect(deleteBtn).toBeDefined();

        if (deleteBtn) {
            fireEvent.click(deleteBtn);
            expect(mockMutate).toHaveBeenCalledWith({
                examId: 'exam-1',
                id: 'assignment-1',
            });
        }
    });
});
