import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SupportHeader } from './support-header';
import { useProfileQuery } from '@sentinel/hooks';
import React from 'react';

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

vi.mock('../common/support-notification-dropdown', () => ({
    SupportNotificationDropdown: () => <div data-testid="notifications" />,
}));

vi.mock('../common/dashboard-profile-dropdown', () => ({
    DashboardProfileDropdown: () => <div data-testid="profile-dropdown" />,
    DashboardProfileDropdownFallback: () => <div data-testid="profile-dropdown-fallback" />,
}));

describe('SupportHeader', () => {
    it('renders institution name when loaded', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                institution: 'Support HQ',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<SupportHeader />);
        expect(screen.getByText('Support HQ')).toBeTruthy();
        expect(screen.queryByText('Support Portal')).toBeNull();
    });

    it('renders "Support Portal" fallback when loading', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: null,
            isLoading: true,
        } as unknown as ReturnType<typeof useProfileQuery>);

        render(<SupportHeader />);
        expect(screen.getByText('Support Portal')).toBeTruthy();
    });
});
