import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreNotificationDropdown } from './core-notification-dropdown';
import { ApiError, getNotifications, markNotificationRead } from '@sentinel/services';

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
        markNotificationRead: vi.fn(),
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

function buildNotification(overrides?: Record<string, unknown>) {
    return {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Subject request approved',
        message: 'Alex approved 3 pending subject requests.',
        status: 'UNREAD',
        actionType: 'SUBJECT_ENROLLMENT_REQUEST_APPROVED',
        institutionId: '22222222-2222-2222-2222-222222222222',
        actor: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'Alex Admin',
        },
        resource: {
            type: 'SUBJECT_ENROLLMENT_REQUEST',
            id: '44444444-4444-4444-4444-444444444444',
            label: 'Programming Languages',
        },
        metadata: {
            requestIds: ['44444444-4444-4444-4444-444444444444'],
        },
        createdAt: '2026-05-10T08:00:00.000Z',
        readAt: null,
        ...overrides,
    };
}

describe('CoreNotificationDropdown', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    async function openNotifications() {
        const trigger = await screen.findByRole('button', { name: 'Open notifications' });
        fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
        fireEvent.click(trigger);
        return trigger;
    }

    it('renders unread notifications from the API', async () => {
        vi.mocked(getNotifications).mockResolvedValue({
            items: [buildNotification()],
            unreadCount: 1,
        });

        render(<CoreNotificationDropdown />, {
            wrapper: createWrapper(),
        });

        const trigger = await openNotifications();
        expect(trigger).toBeTruthy();

        expect(await screen.findByText('Subject request approved')).toBeTruthy();
        expect(screen.getByText('Alex approved 3 pending subject requests.')).toBeTruthy();
        expect(screen.getByText('1 unread')).toBeTruthy();
    });

    it('marks an unread notification as read and refetches the list', async () => {
        vi.mocked(getNotifications)
            .mockResolvedValueOnce({
                items: [buildNotification()],
                unreadCount: 1,
            })
            .mockResolvedValueOnce({
                items: [buildNotification({ status: 'READ', readAt: '2026-05-10T08:05:00.000Z' })],
                unreadCount: 0,
            });
        vi.mocked(markNotificationRead).mockResolvedValue(
            buildNotification({ status: 'READ', readAt: '2026-05-10T08:05:00.000Z' }) as never,
        );

        render(<CoreNotificationDropdown />, {
            wrapper: createWrapper(),
        });

        await openNotifications();

        const item = await screen.findByText('Subject request approved');
        fireEvent.click(item);

        await waitFor(() => {
            expect(markNotificationRead).toHaveBeenCalledWith(
                mockApiClient,
                '11111111-1111-1111-1111-111111111111',
            );
        });

        await waitFor(() => {
            expect(getNotifications).toHaveBeenCalledTimes(2);
        });
    });

    it('renders an empty state when there are no notifications', async () => {
        vi.mocked(getNotifications).mockResolvedValue({
            items: [],
            unreadCount: 0,
        });

        render(<CoreNotificationDropdown />, {
            wrapper: createWrapper(),
        });

        await openNotifications();

        expect(await screen.findByText('No notifications yet.')).toBeTruthy();
    });

    it('hides the notification surface when the role is forbidden', async () => {
        vi.mocked(getNotifications).mockRejectedValue(
            new ApiError({
                message: 'Forbidden',
                status: 403,
                statusText: 'Forbidden',
            }),
        );

        render(<CoreNotificationDropdown />, {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(getNotifications).toHaveBeenCalledWith(mockApiClient, { limit: 5 });
        });

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: 'Open notifications' })).toBeNull();
        });
    });

    it('renders safely when the action type is unknown to the client', async () => {
        vi.mocked(getNotifications).mockResolvedValue({
            items: [
                buildNotification({
                    title: 'Imported notification',
                    message: 'A new notification type was delivered.',
                    actionType: 'UNKNOWN_ACTION_TYPE',
                }),
            ] as never,
            unreadCount: 1,
        });

        render(<CoreNotificationDropdown />, {
            wrapper: createWrapper(),
        });

        await openNotifications();

        expect(await screen.findByText('Imported notification')).toBeTruthy();
        expect(screen.getByText('A new notification type was delivered.')).toBeTruthy();
    });
});
