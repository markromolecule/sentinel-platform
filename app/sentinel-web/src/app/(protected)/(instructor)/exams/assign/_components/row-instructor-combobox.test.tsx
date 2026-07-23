import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { RowInstructorCombobox } from './row-instructor-combobox';

vi.mock('@sentinel/hooks', () => ({
    useUserSearch: vi.fn(() => ({
        users: [{ id: 'user-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@sentinel.edu' }],
        isLoading: false,
    })),
}));

describe('RowInstructorCombobox', () => {
    const mockUsers = [
        { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@sentinel.edu' },
    ];
    const mockOnValueChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with placeholder and matches selected user display name', () => {
        render(
            <RowInstructorCombobox
                value="user-1"
                onValueChange={mockOnValueChange}
                users={mockUsers}
                placeholder="Select instructor"
            />,
        );

        // Display value should be the formatted name
        const input = screen.getByRole('combobox') as HTMLInputElement;
        expect(input.value).toBe('John Doe');
    });

    it('does not display a "No instructor" option in the list', () => {
        render(
            <RowInstructorCombobox
                value="none"
                onValueChange={mockOnValueChange}
                users={mockUsers}
                placeholder="Select instructor"
            />,
        );

        // Open combobox
        const input = screen.getByRole('combobox');
        fireEvent.focus(input);

        // No instructor choice should not exist
        expect(screen.queryByText('No instructor')).toBeNull();
    });
});
