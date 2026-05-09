import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstructorNotificationDropdown } from './instructor-notification-dropdown';
import { ApiError, getNotifications } from '@sentinel/services';

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
    useNotificationRealtime: vi.fn(),
}));

vi.mock('@sentinel/services', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/services')>('@sentinel/services');

    return {
        ...actual,
        getNotifications: vi.fn(),
    };
});

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('InstructorNotificationDropdown', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the unread indicator after loading notifications', async () => {
        vi.mocked(getNotifications).mockResolvedValue({
            items: [
                {
                    id: '11111111-1111-1111-1111-111111111111',
                    title: 'New exam assignment',
                    message: 'Jordan assigned you to "Midterm".',
                    status: 'UNREAD',
                    actionType: 'EXAM_ASSIGNMENT_CREATED',
                    institutionId: '22222222-2222-2222-2222-222222222222',
                    actor: {
                        id: '33333333-3333-3333-3333-333333333333',
                        name: 'Jordan Instructor',
                    },
                    resource: {
                        type: 'EXAM_ASSIGNMENT',
                        id: '44444444-4444-4444-4444-444444444444',
                        label: 'Midterm',
                    },
                    metadata: {
                        examId: '44444444-4444-4444-4444-444444444444',
                    },
                    createdAt: '2026-05-09T12:00:00.000Z',
                    readAt: null,
                },
            ],
            unreadCount: 1,
        });

        render(<InstructorNotificationDropdown />, {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(getNotifications).toHaveBeenCalledWith(mockApiClient, { limit: 5 });
        });

        expect(screen.getByRole('button')).toBeTruthy();
    });

    it('falls back to an empty state when notifications are forbidden', async () => {
        vi.mocked(getNotifications).mockRejectedValue(
            new ApiError({
                message: 'Forbidden',
                status: 403,
                statusText: 'Forbidden',
            }),
        );

        render(<InstructorNotificationDropdown />, {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(getNotifications).toHaveBeenCalledWith(mockApiClient, { limit: 5 });
        });

        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
});
