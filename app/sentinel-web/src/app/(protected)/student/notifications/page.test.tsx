'use client';

import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './page';

const {
    mockUseNotificationsQuery,
    mockUseDeleteNotificationsMutation,
    mockUseNotificationRealtime,
    mockMutate,
} = vi.hoisted(() => ({
    mockUseNotificationsQuery: vi.fn(),
    mockUseDeleteNotificationsMutation: vi.fn(),
    mockUseNotificationRealtime: vi.fn(),
    mockMutate: vi.fn((ids: string[], options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useNotificationsQuery: (...args: any[]) => mockUseNotificationsQuery(...args),
    useDeleteNotificationsMutation: (...args: any[]) => mockUseDeleteNotificationsMutation(...args),
    useNotificationRealtime: (...args: any[]) => mockUseNotificationRealtime(...args),
}));

vi.mock('./_components/notification-list', () => ({
    NotificationList: ({
        notifications,
        rowSelection,
        onRowSelectionChange,
        onDeleteSelected,
        isDeleting,
        isLoading,
    }: {
        notifications: Array<{
            id: string;
            title: string;
            type: string;
            priority: string;
            isRead: boolean;
            link?: string;
        }>;
        rowSelection: Record<string, boolean>;
        onRowSelectionChange: (selection: Record<string, boolean>) => void;
        onDeleteSelected: () => void;
        isDeleting?: boolean;
        isLoading?: boolean;
    }) => (
        <div>
            <div data-testid="loading">{String(Boolean(isLoading))}</div>
            <div data-testid="selected-count">
                {Object.values(rowSelection).filter(Boolean).length}
            </div>
            <div data-testid="first-notification">
                {notifications[0]
                    ? `${notifications[0].title}|${notifications[0].type}|${notifications[0].priority}|${notifications[0].isRead ? 'read' : 'unread'}|${notifications[0].link ?? 'none'}`
                    : 'empty'}
            </div>
            <button type="button" onClick={() => onRowSelectionChange({ 0: true })}>
                Select first
            </button>
            <button type="button" onClick={onDeleteSelected}>
                Delete selected
            </button>
            <div data-testid="deleting">{String(Boolean(isDeleting))}</div>
        </div>
    ),
}));

describe('NotificationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseNotificationRealtime.mockReturnValue(undefined);
        mockUseNotificationsQuery.mockReturnValue({
            data: {
                items: [],
                unreadCount: 0,
            },
            isLoading: false,
        });
        mockUseDeleteNotificationsMutation.mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('shows a loading state while notifications are being fetched', () => {
        mockUseNotificationsQuery.mockReturnValue({
            data: {
                items: [],
                unreadCount: 0,
            },
            isLoading: true,
        });

        render(<NotificationsPage />);

        expect(screen.getByTestId('loading').textContent).toBe('true');
    });

    it('renders live notifications mapped into the student table model', () => {
        mockUseNotificationsQuery.mockReturnValue({
            data: {
                items: [
                    {
                        id: '11111111-1111-1111-1111-111111111111',
                        title: 'Exam assignment created',
                        message: 'Your exam assignment is ready.',
                        status: 'UNREAD',
                        actionType: 'EXAM_ASSIGNMENT_CREATED',
                        institutionId: null,
                        actor: { id: null, name: null },
                        resource: {
                            type: 'EXAM_ASSIGNMENT',
                            id: '22222222-2222-2222-2222-222222222222',
                            label: 'Midterm',
                        },
                        metadata: null,
                        createdAt: '2026-06-10T08:00:00.000Z',
                        readAt: null,
                    },
                ],
                unreadCount: 1,
            },
            isLoading: false,
        });

        render(<NotificationsPage />);

        expect(screen.getByTestId('first-notification').textContent).toBe(
            'Exam assignment created|exam|medium|unread|/student/exam/22222222-2222-2222-2222-222222222222/instruction',
        );
    });

    it('bulk deletes the selected notifications and clears the selection after success', async () => {
        mockUseNotificationsQuery.mockReturnValue({
            data: {
                items: [
                    {
                        id: '11111111-1111-1111-1111-111111111111',
                        title: 'Exam assignment created',
                        message: 'Your exam assignment is ready.',
                        status: 'UNREAD',
                        actionType: 'EXAM_ASSIGNMENT_CREATED',
                        institutionId: null,
                        actor: { id: null, name: null },
                        resource: {
                            type: 'EXAM_ASSIGNMENT',
                            id: '22222222-2222-2222-2222-222222222222',
                            label: 'Midterm',
                        },
                        metadata: null,
                        createdAt: '2026-06-10T08:00:00.000Z',
                        readAt: null,
                    },
                    {
                        id: '33333333-3333-3333-3333-333333333333',
                        title: 'Support task completed',
                        message: 'A support operation updated the institution template.',
                        status: 'READ',
                        actionType: 'SUPPORT_OPERATION_COMPLETED',
                        institutionId: null,
                        actor: { id: null, name: null },
                        resource: {
                            type: 'SUPPORT_OPERATION',
                            id: '44444444-4444-4444-4444-444444444444',
                            label: 'Template',
                        },
                        metadata: null,
                        createdAt: '2026-06-11T08:00:00.000Z',
                        readAt: '2026-06-11T08:05:00.000Z',
                    },
                ],
                unreadCount: 1,
            },
            isLoading: false,
        });

        render(<NotificationsPage />);

        fireEvent.click(screen.getByRole('button', { name: 'Select first' }));

        await waitFor(() => {
            expect(screen.getByTestId('selected-count').textContent).toBe('1');
        });

        fireEvent.click(screen.getByRole('button', { name: 'Delete selected' }));

        expect(mockMutate).toHaveBeenCalledWith(['11111111-1111-1111-1111-111111111111'], {
            onSuccess: expect.any(Function),
        });

        await waitFor(() => {
            expect(screen.getByTestId('selected-count').textContent).toBe('0');
        });
    });
});
