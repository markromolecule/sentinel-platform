import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentHeader from './StudentHeader';
import { useProfileQuery } from '@sentinel/hooks';
import React from 'react';

vi.mock('@sentinel/hooks', () => ({
    useProfileQuery: vi.fn(),
    useLogoutMutation: () => ({
        mutate: vi.fn(),
    }),
    useUserSearch: vi.fn().mockReturnValue({ users: [], isLoading: false }),
}));

vi.mock('next/navigation', () => ({
    usePathname: () => '/student/classroom',
    useRouter: () => ({
        push: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(),
    }),
}));

vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: vi.fn(),
    }),
}));

describe('StudentHeader', () => {
    it('renders initials when loaded', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<StudentHeader />);
        expect(screen.getByText('JD')).toBeTruthy();
    });

    it('renders dots/loading indicator when profile is loading', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: null,
            isLoading: true,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<StudentHeader />);
        expect(screen.getByText('...')).toBeTruthy();
    });
});
