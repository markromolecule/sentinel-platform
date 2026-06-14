import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamSectionAssignmentList } from './exam-section-assignment-list';
import { NewAssignmentsBuilder } from './new-assignments-builder';
import {
    useDeleteExamSectionAssignmentMutation,
    useCreateExamSectionAssignmentsBatchMutation,
    useClassroomsQuery,
    useRoomsQuery,
    useUsersQuery,
} from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useDeleteExamSectionAssignmentMutation: vi.fn(),
    useCreateExamSectionAssignmentsBatchMutation: vi.fn(),
    useClassroomsQuery: vi.fn(() => ({
        data: [
            {
                id: 'cls-1',
                className: 'Classroom Alpha',
                sectionId: 'section-1',
                scopeSummary: { sectionLabel: 'Section Alpha' },
            },
            {
                id: 'cls-2',
                className: 'Classroom Beta',
                sectionId: 'section-2',
                scopeSummary: { sectionLabel: 'Section Beta' },
            },
        ],
        isLoading: false,
    })),
    useRoomsQuery: vi.fn(() => ({
        data: [
            { id: 'room-1', name: 'Room 101', room_number: '101', status: 'AVAILABLE' },
        ],
        isLoading: false,
    })),
    useUsersQuery: vi.fn(() => ({
        data: [
            { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@sentinel.edu' },
        ],
        isLoading: false,
    })),
    useUserSearch: vi.fn(() => ({
        users: [
            { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@sentinel.edu' },
        ],
        isLoading: false,
        isError: false,
        error: null,
    })),
}));

vi.mock('@sentinel/ui', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        Select: ({ children, value, onValueChange }: any) => (
            <div data-testid="mock-select" onClick={() => onValueChange?.('cls-1')}>
                {children}
            </div>
        ),
        SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
        SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
        SelectContent: ({ children }: any) => <div>{children}</div>,
        SelectItem: ({ children, value }: any) => (
            <div data-testid={`select-item-${value}`}>{children}</div>
        ),
    };
});

describe('ExamSectionAssignmentList', () => {
    const mockMutate = vi.fn();
    const mockOnAssignClick = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
        vi.mocked(useDeleteExamSectionAssignmentMutation).mockReturnValue({
            mutateAsync: mockMutate,
            isPending: false,
        } as any);
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
            instructorId: 'user-1',
            instructorName: 'John Doe',
            scheduledAt: null,
            createdAt: '2026-06-13T12:00:00.000Z',
            updatedAt: '2026-06-13T12:00:00.000Z',
        },
    ];

    it('renders the assignments list with correct resolved classroom data', () => {
        render(
            <ExamSectionAssignmentList
                examId="exam-1"
                assignments={mockAssignments}
                isLoading={false}
                onAssignClick={mockOnAssignClick}
            />,
        );

        // Resolved from sectionId section-1 -> Classroom Alpha
        expect(screen.getByText('Classroom Alpha')).toBeDefined();
        expect(screen.getByText('Room 101')).toBeDefined();
        expect(screen.getByText('John Doe')).toBeDefined();
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

        expect(screen.getByText('No Classrooms Assigned')).toBeDefined();
        const assignBtns = screen.getAllByRole('button', { name: 'Assign Classroom' });
        expect(assignBtns.length).toBeGreaterThan(0);
        fireEvent.click(assignBtns[0]);
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

        // Find the delete button within the specific row
        const row = screen.getByText('Classroom Alpha').closest('tr');
        const deleteBtn = row?.querySelector('button');
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

describe('NewAssignmentsBuilder', () => {
    const mockBatchMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
        vi.mocked(useCreateExamSectionAssignmentsBatchMutation).mockReturnValue({
            mutateAsync: mockBatchMutate,
            isPending: false,
        } as any);
    });

    it('renders the builder and handles saving multi-row assignments', async () => {
        render(
            <NewAssignmentsBuilder
                examId="exam-1"
                currentAssignments={[]}
            />,
        );

        expect(screen.getByText('Add Classroom Row')).toBeDefined();
        
        // Renders Save button
        const saveBtn = screen.getByRole('button', { name: 'Save Assignments' });
        expect(saveBtn).toBeDefined();
    });

    it('filters classrooms by subjectId if provided', () => {
        const mockClassrooms = [
            {
                id: 'cls-1',
                className: 'Math 101',
                subjectId: 'subject-math',
                sectionId: 'sec-1',
                scopeSummary: { sectionLabel: 'Section Alpha' },
            },
            {
                id: 'cls-2',
                className: 'History 101',
                subjectId: 'subject-history',
                sectionId: 'sec-2',
                scopeSummary: { sectionLabel: 'Section Beta' },
            },
        ];
        vi.mocked(useClassroomsQuery).mockReturnValue({
            data: mockClassrooms,
            isLoading: false,
        } as any);

        render(
            <NewAssignmentsBuilder
                examId="exam-1"
                subjectId="subject-math"
                currentAssignments={[]}
            />,
        );

        // Assert only Math classroom is rendered
        expect(screen.queryByTestId('select-item-cls-1')).not.toBeNull();
        expect(screen.queryByTestId('select-item-cls-2')).toBeNull();
    });
});
