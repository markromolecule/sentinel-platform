import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useCreateCalendarNoteMutation } from './use-create-calendar-note-mutation';
import { createCalendarNoteData } from '@/data/api/calendar/create-calendar-note';
import { type CalendarEventResponse } from '@sentinel/shared';

// Mock createCalendarNoteData
vi.mock('@/data/api/calendar/create-calendar-note', () => ({
    createCalendarNoteData: vi.fn(),
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

describe('useCreateCalendarNoteMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('triggers note creation and invalidates calendar query cache on success', async () => {
        const mockResponse: CalendarEventResponse = {
            eventId: '11111111-1111-4111-8111-111111111111',
            institutionId: '22222222-2222-4222-8222-222222222222',
            title: 'Study Session',
            description: 'Focusing on exam topics',
            eventType: 'NOTE',
            targetAudience: 'STUDENTS',
            startDate: '2026-05-20T00:00:00.000Z',
            endDate: null,
            startTime: '10:00:00',
            endTime: '12:00:00',
            createdBy: '33333333-3333-4333-8333-333333333333',
            createdByName: 'John Doe',
            createdAt: '2026-05-19T00:00:00.000Z',
            updatedAt: null,
        };

        vi.mocked(createCalendarNoteData).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useCreateCalendarNoteMutation(), {
            wrapper: createWrapper(),
        });

        const payload = {
            title: 'Study Session',
            description: 'Focusing on exam topics',
            startDate: '2026-05-20T00:00:00.000Z',
            startTime: '10:00:00',
            endTime: '12:00:00',
        };

        result.current.mutate(payload);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockResponse);
        expect(createCalendarNoteData).toHaveBeenCalledWith(payload);
    });
});
