import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { CreateClassroomDialog } from './create-classroom-dialog';
import {
    useCreateClassroomMutation,
    useSubjectOfferingsQuery,
    useUsersQuery,
    useApi,
} from '@sentinel/hooks';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import React from 'react';

afterEach(() => {
    cleanup();
});

vi.mock('@sentinel/hooks', () => ({
    useCreateClassroomMutation: vi.fn(),
    useSubjectOfferingsQuery: vi.fn(),
    useUsersQuery: vi.fn(),
    useApi: vi.fn(),
}));

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: vi.fn(),
}));

vi.mock('@sentinel/services', () => ({
    assignClassroomInstructor: vi.fn(),
}));

const mockSubjectOfferings = [
    {
        id: 'sub-1',
        subjectCode: 'GENAT01R',
        subjectTitle: 'NATIONALIAN COURSE',
        termSemester: '1st Semester',
        termAcademicYear: '2025-2026',
        sections: [
            { id: 'sec-1', name: 'INF232', yearLevel: 3 },
            { id: 'sec-2', name: 'INF233', yearLevel: 3 },
        ],
    },
    {
        id: 'sub-2',
        subjectCode: 'MATH101',
        subjectTitle: 'COLLEGE ALGEBRA',
        termSemester: '1st Semester',
        termAcademicYear: '2025-2026',
        sections: [{ id: 'sec-3', name: 'M101A', yearLevel: 1 }],
    },
];

describe('CreateClassroomDialog', () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'classroom-123' });
    const mockOnOpenChangeAction = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useAcademicScope).mockReturnValue({
            institutionId: 'inst-123',
        } as any);

        vi.mocked(useSubjectOfferingsQuery).mockReturnValue({
            data: mockSubjectOfferings,
            isLoading: false,
        } as any);

        vi.mocked(useUsersQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as any);

        vi.mocked(useCreateClassroomMutation).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        } as any);

        vi.mocked(useApi).mockReturnValue({} as any);
    });

    it('renders Step 1 with search input and subject cards', () => {
        render(
            <CreateClassroomDialog
                open={true}
                onOpenChangeAction={mockOnOpenChangeAction}
                configuredClassGroupIds={[]}
            />,
        );

        // Verify stepper exists
        expect(screen.getByText('Select Subject')).toBeDefined();
        expect(screen.getByText('Classroom Details')).toBeDefined();

        // Verify search input is present
        expect(screen.getByPlaceholderText('Search subjects by code or title...')).toBeDefined();

        // Verify subject offerings cards render
        expect(screen.getByText('GENAT01R')).toBeDefined();
        expect(screen.getByText(/NATIONALIAN COURSE/)).toBeDefined();
        expect(screen.getByText('MATH101')).toBeDefined();
        expect(screen.getByText(/COLLEGE ALGEBRA/)).toBeDefined();
    });

    it('filters subject card list on typing in search bar', async () => {
        render(
            <CreateClassroomDialog
                open={true}
                onOpenChangeAction={mockOnOpenChangeAction}
                configuredClassGroupIds={[]}
            />,
        );

        const searchInput = screen.getByPlaceholderText(
            'Search subjects by code or title...',
        ) as HTMLInputElement;

        // Type 'MATH'
        fireEvent.change(searchInput, { target: { value: 'MATH' } });

        await waitFor(() => {
            expect(screen.queryByText('GENAT01R')).toBeNull(); // Should be filtered out
            expect(screen.getByText('MATH101')).toBeDefined(); // Should match
        });
    });

    it('auto-advances to Step 2 upon selecting a subject card, pre-selecting the first section and suggested name', async () => {
        render(
            <CreateClassroomDialog
                open={true}
                onOpenChangeAction={mockOnOpenChangeAction}
                configuredClassGroupIds={[]}
            />,
        );

        // Click the GENAT01R subject card
        const card = screen.getByText('GENAT01R').closest('.group')!;
        fireEvent.click(card);

        // Should advance to Step 2
        await waitFor(() => {
            // Verify context banner of selected subject is displayed
            expect(screen.getByText('GENAT01R - NATIONALIAN COURSE')).toBeDefined();
            // Verify Section Chips are rendered
            expect(screen.getByText('INF232 • Year 3')).toBeDefined();
            expect(screen.getByText('INF233 • Year 3')).toBeDefined();
            expect(screen.getByPlaceholderText('Search and select an instructor...')).toBeDefined();
        });

        expect(useUsersQuery).toHaveBeenCalledWith({
            role: 'instructor',
            institutionId: 'inst-123',
            enabled: true,
        });

        // Verify suggested name is set in name input placeholder
        const nameInput = screen.getByLabelText('Classroom Name') as HTMLInputElement;
        expect(nameInput.placeholder).toBe('GENAT01R INF232');
    });

    it('updates suggested classroom name when clicking a different section chip', async () => {
        render(
            <CreateClassroomDialog
                open={true}
                onOpenChangeAction={mockOnOpenChangeAction}
                configuredClassGroupIds={[]}
            />,
        );

        // Advance to Step 2
        fireEvent.click(screen.getByText('GENAT01R').closest('.group')!);

        await waitFor(() => {
            expect(screen.getByText('INF233 • Year 3')).toBeDefined();
        });

        // Click the second section chip
        fireEvent.click(screen.getByText('INF233 • Year 3'));

        // Name input placeholder should update suggested value
        const nameInput = screen.getByLabelText('Classroom Name') as HTMLInputElement;
        expect(nameInput.placeholder).toBe('GENAT01R INF233');
    });

    it('navigates back to Step 1 when Back button is clicked', async () => {
        render(
            <CreateClassroomDialog
                open={true}
                onOpenChangeAction={mockOnOpenChangeAction}
                configuredClassGroupIds={[]}
            />,
        );

        // Advance to Step 2
        fireEvent.click(screen.getByText('GENAT01R').closest('.group')!);

        await waitFor(() => {
            expect(screen.getByText('Back')).toBeDefined();
        });

        // Click Back button
        fireEvent.click(screen.getByText('Back'));

        // Verify we are on Step 1 again (search input visible)
        await waitFor(() => {
            expect(
                screen.getByPlaceholderText('Search subjects by code or title...'),
            ).toBeDefined();
        });
    });

    it('triggers classroom creation on submit click', async () => {
        render(
            <CreateClassroomDialog
                open={true}
                onOpenChangeAction={mockOnOpenChangeAction}
                configuredClassGroupIds={[]}
            />,
        );

        // Go to Step 2
        fireEvent.click(screen.getByText('GENAT01R').closest('.group')!);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Create Classroom' })).toBeDefined();
        });

        // Click submit button
        fireEvent.click(screen.getByRole('button', { name: 'Create Classroom' }));

        expect(mockMutateAsync).toHaveBeenCalledWith({
            classGroupId: 'sec-1',
            className: 'GENAT01R INF232',
        });
    });
});
