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
    useProfileQuery,
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
        data: [{ id: 'room-1', name: 'Room 101', room_number: '101', status: 'AVAILABLE' }],
        isLoading: false,
    })),
    useUsersQuery: vi.fn(() => ({
        data: [{ id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@sentinel.edu' }],
        isLoading: false,
    })),
    useProfileQuery: vi.fn(() => ({
        profile: { institutionId: 'institution-1' },
        isLoading: false,
    })),
    useUserSearch: vi.fn(() => ({
        users: [{ id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@sentinel.edu' }],
        isLoading: false,
        isError: false,
        error: null,
    })),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('./row-classroom-combobox', () => ({
    RowClassroomCombobox: ({ value, onValueChange, classrooms }: any) => (
        <div data-testid="mock-classroom-combobox" onClick={() => onValueChange?.('cls-1')}>
            {classrooms.map((cls: any) => (
                <div key={cls.id} data-testid={`select-item-${cls.id}`}>
                    {cls.className}
                </div>
            ))}
        </div>
    ),
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
    let latestDeleteOptions: any;

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
        latestDeleteOptions = undefined;
        vi.mocked(useDeleteExamSectionAssignmentMutation).mockImplementation((options: any) => {
            latestDeleteOptions = options;
            return {
                mutateAsync: async (payload: { examId: string; id: string }) => {
                    mockMutate(payload);
                    await options?.onSuccess?.({ id: payload.id }, payload, undefined);
                    return { id: payload.id };
                },
                isPending: false,
            } as any;
        });
    });

    const mockAssignments = [
        {
            id: 'assignment-1',
            examId: 'exam-1',
            sectionId: 'section-1',
            classGroupId: 'cls-2',
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

        // Resolved from classGroupId cls-2 -> Classroom Beta, even though the section points elsewhere.
        expect(screen.getByText('Classroom Beta')).toBeDefined();
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

    it('opens the delete dialog and confirms assignment removal', async () => {
        render(
            <ExamSectionAssignmentList
                examId="exam-1"
                assignments={mockAssignments}
                isLoading={false}
                onAssignClick={mockOnAssignClick}
            />,
        );

        const row = screen.getByText('Classroom Beta').closest('tr');
        const deleteBtn = row?.querySelector('button');
        expect(deleteBtn).toBeDefined();

        if (deleteBtn) {
            fireEvent.click(deleteBtn);
            expect(screen.getByText('Remove Assignment?')).toBeDefined();

            const removeButton = screen.getByRole('button', { name: 'Remove' });
            fireEvent.click(removeButton);

            expect(mockMutate).toHaveBeenCalledWith({
                examId: 'exam-1',
                id: 'assignment-1',
            });
            expect(latestDeleteOptions).toBeDefined();
        }
    });
});
