import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useDeleteCalendarNoteMutation } from './use-delete-calendar-note-mutation';
import { deleteCalendarEventData } from '@/data/api/calendar/delete-calendar-event';

// Mock deleteCalendarEventData
vi.mock('@/data/api/calendar/delete-calendar-event', () => ({
    deleteCalendarEventData: vi.fn(),
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

describe('useDeleteCalendarNoteMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('triggers note deletion and invalidates calendar query cache on success', async () => {
        vi.mocked(deleteCalendarEventData).mockResolvedValue(undefined);

        const { result } = renderHook(() => useDeleteCalendarNoteMutation(), {
            wrapper: createWrapper(),
        });

        const variables = { eventId: '11111111-1111-4111-8111-111111111111' };
        result.current.mutate(variables);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(deleteCalendarEventData).toHaveBeenCalledWith(variables);
    });
});
