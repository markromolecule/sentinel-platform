import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardProfileDropdown } from './dashboard-profile-dropdown';
import { useUser } from '@/hooks/use-user';
import React from 'react';

vi.mock('@sentinel/hooks', () => ({
    useLogoutMutation: () => ({
        mutate: vi.fn(),
    }),
}));

vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-user', () => ({
    useUser: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

describe('DashboardProfileDropdown', () => {
    it('renders user initials', () => {
        vi.mocked(useUser).mockReturnValue({
            data: {
                email: 'test@example.com',
                user_metadata: {
                    firstName: 'Admin',
                    lastName: 'User',
                },
            },
        } as unknown as ReturnType<typeof useUser>);

        render(<DashboardProfileDropdown />);
        expect(screen.getByText('AU')).toBeTruthy();
    });
});
