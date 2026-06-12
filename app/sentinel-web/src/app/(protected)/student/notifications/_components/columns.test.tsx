'use client';

import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { format } from 'date-fns';
import { getNotificationColumns } from './columns';

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@sentinel/ui', () => ({
    Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Button: ({
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
    Checkbox: ({
        checked,
        onCheckedChange,
        'aria-label': ariaLabel,
    }: {
        checked?: boolean | 'indeterminate';
        onCheckedChange?: (value: boolean) => void;
        'aria-label'?: string;
    }) => (
        <input
            aria-label={ariaLabel}
            type="checkbox"
            checked={checked === true}
            data-state={
                checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked'
            }
            onChange={(event) => onCheckedChange?.(event.target.checked)}
        />
    ),
    DataTableColumnHeader: ({ title }: { title: string }) => <span>{title}</span>,
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({
        children,
        asChild,
        onClick,
        className,
    }: {
        children: React.ReactNode;
        asChild?: boolean;
        onClick?: () => void;
        className?: string;
    }) =>
        asChild ? (
            <>{children}</>
        ) : (
            <button type="button" onClick={onClick} className={className}>
                {children}
            </button>
        ),
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('getNotificationColumns', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders selection checkboxes and toggles the row selection callbacks', () => {
        const columns = getNotificationColumns();
        const toggleAllPageRowsSelected = vi.fn();
        const toggleSelected = vi.fn();
        const header = columns[0].header as (args: any) => React.ReactNode;
        const cell = columns[0].cell as (args: any) => React.ReactNode;

        render(
            <div>
                {header({
                    table: {
                        getIsAllPageRowsSelected: () => false,
                        getIsSomePageRowsSelected: () => false,
                        toggleAllPageRowsSelected,
                    },
                })}
                {cell({
                    row: {
                        getIsSelected: () => false,
                        toggleSelected,
                    },
                })}
            </div>,
        );

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select all' }));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Select row' }));

        expect(toggleAllPageRowsSelected).toHaveBeenCalledWith(true);
        expect(toggleSelected).toHaveBeenCalledWith(true);
    });

    it('renders the notification content and action menu', () => {
        const columns = getNotificationColumns();
        const titleCell = columns[1].cell as (args: any) => React.ReactNode;
        const typeCell = columns[2].cell as (args: any) => React.ReactNode;
        const priorityCell = columns[3].cell as (args: any) => React.ReactNode;
        const dateCell = columns[4].cell as (args: any) => React.ReactNode;
        const actionsCell = columns[5].cell as (args: any) => React.ReactNode;
        const createdAt = new Date('2026-06-11T08:00:00.000Z');

        render(
            <div>
                {titleCell({
                    row: {
                        original: {
                            title: 'Exam assignment created',
                            message: 'Your exam assignment is ready.',
                        },
                    },
                })}
                {typeCell({
                    row: {
                        getValue: () => 'exam',
                    },
                })}
                {priorityCell({
                    row: {
                        getValue: () => 'high',
                    },
                })}
                {dateCell({
                    row: {
                        getValue: () => createdAt,
                    },
                })}
                {actionsCell({
                    row: {
                        original: {
                            link: '/student/exam/123',
                        },
                    },
                })}
            </div>,
        );

        expect(screen.getByText('Exam assignment created')).toBeTruthy();
        expect(screen.getByText('Your exam assignment is ready.')).toBeTruthy();
        expect(screen.getByText('exam')).toBeTruthy();
        expect(screen.getByText('high')).toBeTruthy();
        expect(screen.getByText(format(createdAt, 'MMM d, yyyy h:mm a'))).toBeTruthy();
        expect(screen.getByRole('link', { name: 'View Details' }).getAttribute('href')).toBe(
            '/student/exam/123',
        );
        expect(screen.getByRole('button', { name: 'Mark as read' })).toBeTruthy();
    });
});
