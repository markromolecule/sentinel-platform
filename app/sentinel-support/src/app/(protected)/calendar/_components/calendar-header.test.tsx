import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarHeader } from './calendar-header';

vi.mock('@sentinel/ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@sentinel/ui')>();
    return {
        ...actual,
        Button: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
            <button onClick={onClick}>{children}</button>
        ),
    };
});

describe('CalendarHeader', () => {
    it('hides the add event button when the user cannot create events', () => {
        render(
            <CalendarHeader
                currentMonth={new Date('2026-06-01T00:00:00.000Z')}
                onPreviousMonth={vi.fn()}
                onNextMonth={vi.fn()}
                onToday={vi.fn()}
                onAddEvent={vi.fn()}
                canAddEvent={false}
            />,
        );

        expect(screen.queryByRole('button', { name: /add event/i })).toBeNull();
    });

    it('renders the add event button when create permission is available', () => {
        render(
            <CalendarHeader
                currentMonth={new Date('2026-06-01T00:00:00.000Z')}
                onPreviousMonth={vi.fn()}
                onNextMonth={vi.fn()}
                onToday={vi.fn()}
                onAddEvent={vi.fn()}
                canAddEvent={true}
            />,
        );

        expect(screen.getByRole('button', { name: /add event/i })).toBeDefined();
    });

    it('renders the quiet-month hint when provided', () => {
        render(
            <CalendarHeader
                currentMonth={new Date('2026-06-01T00:00:00.000Z')}
                onPreviousMonth={vi.fn()}
                onNextMonth={vi.fn()}
                onToday={vi.fn()}
                onAddEvent={vi.fn()}
                emptyStateHint="No events scheduled this month."
            />,
        );

        expect(screen.getByText('No events scheduled this month.')).toBeDefined();
    });
});
