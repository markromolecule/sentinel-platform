'use client';

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationList } from './notification-list';

const { mockDataTable, mockButton } = vi.hoisted(() => ({
    mockDataTable: vi.fn(() => <div data-testid="data-table" />),
    mockButton: vi.fn(
        ({
            children,
            onClick,
            disabled,
        }: {
            children: React.ReactNode;
            onClick?: () => void;
            disabled?: boolean;
        }) => (
            <button type="button" onClick={onClick} disabled={disabled}>
                {children}
            </button>
        ),
    ),
}));

vi.mock('@sentinel/ui', () => ({
    Button: (props: any) => mockButton(props),
    DataTable: (props: any) => mockDataTable(props),
}));

vi.mock('./columns', () => ({
    columns: [],
}));

describe('NotificationList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('passes selection state to the table and disables bulk remove when nothing is selected', () => {
        const onRowSelectionChange = vi.fn();
        const onDeleteSelected = vi.fn();

        render(
            <NotificationList
                notifications={[
                    {
                        id: '11111111-1111-1111-1111-111111111111',
                        title: 'Upcoming exam',
                        message: 'Your exam is tomorrow.',
                        type: 'exam',
                        priority: 'high',
                        isRead: false,
                        date: new Date('2026-06-10T08:00:00.000Z'),
                    },
                ]}
                rowSelection={{}}
                onRowSelectionChange={onRowSelectionChange}
                onDeleteSelected={onDeleteSelected}
                isLoading
            />,
        );

        expect(mockDataTable.mock.calls[0]?.[0]).toEqual(
            expect.objectContaining({
                searchKey: 'title',
                searchPlaceholder: 'Search notifications...',
                rowSelection: {},
                onRowSelectionChange,
                emptyContent: 'No notifications yet.',
                isLoading: true,
            }),
        );
        expect(
            screen.getByRole('button', { name: 'Remove selected notifications' }).disabled,
        ).toBe(true);
        expect(screen.getByText('Select notifications to remove them in bulk.')).toBeTruthy();
    });

    it('enables bulk remove when selections exist', () => {
        const onRowSelectionChange = vi.fn();
        const onDeleteSelected = vi.fn();

        render(
            <NotificationList
                notifications={[]}
                rowSelection={{ 0: true, 1: false }}
                onRowSelectionChange={onRowSelectionChange}
                onDeleteSelected={onDeleteSelected}
            />,
        );

        expect(screen.getByText('1 selected')).toBeTruthy();
        const removeButton = screen.getByRole('button', { name: 'Remove selected notifications' });
        expect(removeButton.disabled).toBe(false);

        fireEvent.click(removeButton);
        expect(onDeleteSelected).toHaveBeenCalledTimes(1);
    });
});
