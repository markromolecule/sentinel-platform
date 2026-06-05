import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { AdminHeader } from './admin-header';
import { useProfileQuery } from '@sentinel/hooks';
import React from 'react';

afterEach(() => {
    cleanup();
});

vi.mock('@sentinel/hooks', () => ({
    useProfileQuery: vi.fn(),
    useUserSearch: vi.fn().mockReturnValue({ users: [], isLoading: false }),
}));

vi.mock('@sentinel/ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@sentinel/ui')>();
    return {
        ...actual,
        SidebarTrigger: () => <div data-testid="sidebar-trigger" />,
    };
});

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(),
    }),
}));

vi.mock('../common/core-notification-dropdown', () => ({
    CoreNotificationDropdown: () => <div data-testid="notifications" />,
}));

vi.mock('../common/dashboard-profile-dropdown', () => ({
    DashboardProfileDropdown: () => <div data-testid="profile-dropdown" />,
    DashboardProfileDropdownFallback: () => <div data-testid="profile-dropdown-fallback" />,
}));

describe('AdminHeader', () => {
    it('renders institution name when loaded', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                institution: 'Admin HQ',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<AdminHeader />);
        expect(screen.getByText('Admin HQ')).toBeTruthy();
    });

    it('renders nothing for institution when loading', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: null,
            isLoading: true,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<AdminHeader />);
        expect(screen.queryByText('Admin HQ')).toBeNull();
    });
});
