// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ProctorCalendarPage from './page';

afterEach(() => {
    cleanup();
});

vi.mock('@sentinel/hooks', () => ({
    useCalendarEventsQuery: vi.fn(),
}));

vi.mock('@/features/calendar', () => ({
    useCalendar: () => ({
        currentMonth: new Date('2026-06-01T00:00:00.000Z'),
        selectedDate: new Date('2026-06-15T00:00:00.000Z'),
        isDetailsOpen: false,
        setIsDetailsOpen: vi.fn(),
        calendarDays: [new Date('2026-06-15T00:00:00.000Z')],
        handlePreviousMonth: vi.fn(),
        handleNextMonth: vi.fn(),
        handleToday: vi.fn(),
        handleDayClick: vi.fn(),
    }),
    CalendarHeader: ({ emptyStateHint }: { emptyStateHint?: string }) => (
        <div data-testid="calendar-header">
            Calendar Header
            {emptyStateHint ? <span>{emptyStateHint}</span> : null}
        </div>
    ),
    CalendarGrid: ({
        getEventsForDate,
    }: {
        getEventsForDate: (date: Date) => Array<{ title: string }>;
    }) => (
        <div data-testid="calendar-grid">
            Events on June 15: {getEventsForDate(new Date('2026-06-15T00:00:00.000Z')).length}
        </div>
    ),
    DayDetailsSheet: () => <div data-testid="day-details-sheet">Details Sheet</div>,
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');

    return {
        ...actual,
        Separator: () => <div data-testid="calendar-separator" />,
        Skeleton: ({ className }: { className?: string }) => (
            <div data-testid="calendar-skeleton" className={className} />
        ),
    };
});

import { useCalendarEventsQuery } from '@sentinel/hooks';

const mockUseCalendarEventsQuery = vi.mocked(useCalendarEventsQuery);

describe('ProctorCalendarPage', () => {
    it('renders the mirrored calendar shell and header controls', () => {
        mockUseCalendarEventsQuery.mockReturnValue({
            data: [],
            isLoading: false,
        } as any);

        render(<ProctorCalendarPage />);

        expect(screen.getByText('Calendar')).toBeTruthy();
        expect(
            screen.getByText('View institution events, announcements, and schedules.'),
        ).toBeTruthy();
        expect(screen.getByTestId('calendar-header')).toBeTruthy();
        expect(screen.getByText('No events scheduled this month.')).toBeTruthy();
        expect(screen.getByTestId('calendar-separator')).toBeTruthy();
    });

    it('maps API events into the calendar grid', () => {
        mockUseCalendarEventsQuery.mockReturnValue({
            data: [
                {
                    eventId: 'event-1',
                    institutionId: 'inst-1',
                    title: 'Orientation',
                    description: 'Welcome session',
                    eventType: 'ANNOUNCEMENT',
                    targetAudience: 'ALL',
                    startDate: '2026-06-15T00:00:00.000Z',
                    endDate: null,
                    startTime: '09:00:00',
                    endTime: '10:00:00',
                    createdBy: 'user-1',
                    createdByName: 'Admin User',
                    createdAt: '2026-06-01T00:00:00.000Z',
                    updatedAt: null,
                },
            ],
            isLoading: false,
        } as any);

        render(<ProctorCalendarPage />);

        expect(screen.getByText('Events on June 15: 1')).toBeTruthy();
        expect(screen.queryByText('No scheduled exams or events found for this month.')).toBeNull();
    });

    it('renders loading skeletons while calendar data is loading', () => {
        mockUseCalendarEventsQuery.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any);

        render(<ProctorCalendarPage />);

        expect(screen.getAllByTestId('calendar-skeleton')).toHaveLength(35);
    });
});
