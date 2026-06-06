import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { InstructorSearchCombobox } from './instructor-search-combobox';
import { useUsersQuery } from '@sentinel/hooks';
import React from 'react';

afterEach(() => {
    cleanup();
});

vi.mock('@sentinel/hooks', () => ({
    useUsersQuery: vi.fn(),
}));

const mockInstructors = [
    {
        id: 'inst-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@sentinel.edu',
        role: 'instructor',
        status: 'ACTIVE',
    },
    {
        id: 'inst-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@sentinel.edu',
        role: 'instructor',
        status: 'ACTIVE',
    },
    {
        id: 'inst-3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@sentinel.edu',
        role: 'instructor',
        status: 'ACTIVE',
    },
];

describe('InstructorSearchCombobox', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders placeholder and loading state correctly', () => {
        vi.mocked(useUsersQuery).mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: null,
        } as any);

        render(
            <InstructorSearchCombobox
                onValueChange={() => {}}
                institutionId="inst-id"
                placeholder="Search instructors..."
            />,
        );

        const input = screen.getByPlaceholderText('Search instructors...');
        expect(input).toBeDefined();
        expect(input.hasAttribute('disabled')).toBe(true);
    });

    it('renders filtered list when focused and typed', async () => {
        vi.mocked(useUsersQuery).mockReturnValue({
            data: mockInstructors,
            isLoading: false,
            isError: false,
            error: null,
        } as any);

        const onValueChangeMock = vi.fn();

        render(
            <InstructorSearchCombobox
                onValueChange={onValueChangeMock}
                institutionId="inst-id"
                placeholder="Search instructors..."
            />,
        );

        const input = screen.getByPlaceholderText('Search instructors...') as HTMLInputElement;
        expect(input.hasAttribute('disabled')).toBe(false);

        // Click or focus input to open dropdown
        fireEvent.focus(input);

        // Verify all instructors are displayed by default
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeDefined();
            expect(screen.getByText('Jane Smith')).toBeDefined();
            expect(screen.getByText('Bob Johnson')).toBeDefined();
        });

        // Type 'Jane'
        fireEvent.change(input, { target: { value: 'Jane' } });

        // Jane Smith should be visible, John Doe should not be visible in filtered list
        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeDefined();
            expect(screen.queryByText('John Doe')).toBeNull();
        });
    });

    it('excludes specified user IDs', async () => {
        vi.mocked(useUsersQuery).mockReturnValue({
            data: mockInstructors,
            isLoading: false,
            isError: false,
            error: null,
        } as any);

        render(
            <InstructorSearchCombobox
                onValueChange={() => {}}
                institutionId="inst-id"
                excludeUserIds={['inst-1']}
                placeholder="Search instructors..."
            />,
        );

        const input = screen.getByPlaceholderText('Search instructors...');
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.queryByText('John Doe')).toBeNull(); // Excluded
            expect(screen.getByText('Jane Smith')).toBeDefined();
            expect(screen.getByText('Bob Johnson')).toBeDefined();
        });
    });
});
