import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserSearchBar } from './user-search-bar';
import { useUserSearch } from '@sentinel/hooks';
import { useRouter } from 'next/navigation';
import React from 'react';

vi.mock('@sentinel/hooks', () => ({
    useUserSearch: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

global.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
};

describe('UserSearchBar', () => {
    it('renders the search button and opens the popover', () => {
        const pushMock = vi.fn();
        vi.mocked(useRouter).mockReturnValue({
            push: pushMock,
        } as unknown as ReturnType<typeof useRouter>);

        vi.mocked(useUserSearch).mockReturnValue({
            users: [
                {
                    id: 'user-123',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'student',
                },
            ],
            isLoading: false,
        } as unknown as ReturnType<typeof useUserSearch>);

        render(<UserSearchBar redirectPath="/student/message" />);

        const searchButton = screen.getByRole('button', { name: 'Search users' });
        expect(searchButton).toBeTruthy();

        // Open popover
        fireEvent.click(searchButton);

        // Find the input placeholder
        const input = screen.getByPlaceholderText('Search users by name...');
        expect(input).toBeTruthy();

        // Type search query
        fireEvent.change(input, { target: { value: 'John' } });

        // Check if user is displayed
        expect(screen.getByText('John Doe')).toBeTruthy();
        expect(screen.getByText('student')).toBeTruthy();

        // Select the user
        const userItem = screen.getByText('John Doe').closest('[role="option"]');
        expect(userItem).toBeTruthy();
        if (userItem) {
            fireEvent.click(userItem);
        }

        expect(pushMock).toHaveBeenCalledWith('/student/message?userId=user-123');
    });
});
