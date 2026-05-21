import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useCreateCalendarEventMutation } from './use-create-calendar-event-mutation';
import { createCalendarEventData } from '@/data/api/calendar/create-calendar-event';
import { type CalendarEventResponse } from '@sentinel/shared';

// Mock createCalendarEventData
vi.mock('@/data/api/calendar/create-calendar-event', () => ({
    createCalendarEventData: vi.fn(),
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

describe('useCreateCalendarEventMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('triggers event creation and invalidates calendar cache on success', async () => {
        const mockResponse: CalendarEventResponse = {
            eventId: '11111111-1111-4111-8111-111111111111',
            institutionId: '22222222-2222-4222-8222-222222222222',
            title: 'General Assembly',
            description: 'All departments gathering',
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
        };

        vi.mocked(createCalendarEventData).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useCreateCalendarEventMutation(), {
            wrapper: createWrapper(),
        });

        const payload = {
            title: 'General Assembly',
            description: 'All departments gathering',
            eventType: 'EVENT' as const,
            targetAudience: 'ALL' as const,
            startDate: '2026-05-20T00:00:00.000Z',
            startTime: '08:00:00',
            endTime: '12:00:00',
        };

        result.current.mutate(payload);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockResponse);
        expect(createCalendarEventData).toHaveBeenCalledWith(payload);
    });
});
