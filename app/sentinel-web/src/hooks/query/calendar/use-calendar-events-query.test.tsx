import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useCalendarEventsQuery } from './use-calendar-events-query';
import { getCalendarEventsData } from '@/data/api/calendar/get-calendar-events';
import { type CalendarEventResponse } from '@sentinel/shared';

// Mock getCalendarEventsData
vi.mock('@/data/api/calendar/get-calendar-events', () => ({
    getCalendarEventsData: vi.fn(),
}));

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

describe('useCalendarEventsQuery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns loading state initially and then calendar events on success', async () => {
        const mockEvents: CalendarEventResponse[] = [
            {
                eventId: '11111111-1111-4111-8111-111111111111',
                institutionId: '22222222-2222-4222-8222-222222222222',
                title: 'Term Examination',
                description: 'Midterm exams schedule',
                eventType: 'EVENT',
                targetAudience: 'ALL',
                startDate: '2026-05-20T00:00:00.000Z',
                endDate: null,
                startTime: '08:00:00',
                endTime: '12:00:00',
                createdBy: '33333333-3333-4333-8333-333333333333',
                createdByName: 'John Doe',
                createdAt: '2026-05-19T00:00:00.000Z',
                updatedAt: null,
            },
        ];

        vi.mocked(getCalendarEventsData).mockResolvedValue(mockEvents);

        const { result } = renderHook(
            () =>
                useCalendarEventsQuery({
                    payload: { month: 5, year: 2026 },
                }),
            {
                wrapper: createWrapper(),
            },
        );

        // Verify initial loading state
        expect(result.current.isLoading).toBe(true);

        // Wait for query resolution and assert data
        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockEvents);
        expect(getCalendarEventsData).toHaveBeenCalledWith({ month: 5, year: 2026 });
    });

    it('returns error state if query function throws an error', async () => {
        const apiError = new Error('API request failed');
        vi.mocked(getCalendarEventsData).mockRejectedValue(apiError);

        const { result } = renderHook(
            () =>
                useCalendarEventsQuery({
                    payload: { month: 5, year: 2026 },
                }),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(apiError);
    });
});
