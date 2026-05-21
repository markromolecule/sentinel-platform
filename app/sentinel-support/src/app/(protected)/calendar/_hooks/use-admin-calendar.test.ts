import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Prevent Supabase client init error in test environment
vi.mock('@/data/supabase/client', () => ({ supabaseClient: {} }));
vi.mock('@/data/api/client', () => ({
    apiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/hooks/query/calendar/use-calendar-events-query');
vi.mock('@/hooks/mutations/calendar/use-create-calendar-event-mutation');
vi.mock('@/hooks/mutations/calendar/use-delete-calendar-event-mutation');

import { useCalendarEventsQuery } from '@/hooks/query/calendar/use-calendar-events-query';
import { useCreateCalendarEventMutation } from '@/hooks/mutations/calendar/use-create-calendar-event-mutation';
import { useDeleteCalendarEventMutation } from '@/hooks/mutations/calendar/use-delete-calendar-event-mutation';
import { useAdminCalendar } from './use-admin-calendar';

const mockDeleteMutate = vi.fn();

describe('useAdminCalendar (sentinel-support) — audience mapping', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCalendarEventsQuery).mockReturnValue({ data: undefined, isLoading: false } as any);
        vi.mocked(useCreateCalendarEventMutation).mockReturnValue({ mutate: vi.fn(), isPending: false, error: null } as any);
        vi.mocked(useDeleteCalendarEventMutation).mockReturnValue({ mutate: mockDeleteMutate } as any);
    });

    describe('reverse mapping: CalendarEventAudience → TargetAudience (display)', () => {
        const REVERSE_CASES: Array<{ audience: string; expected: string }> = [
            { audience: 'ALL', expected: 'institution' },
            { audience: 'ADMINS', expected: 'administrator' },
            { audience: 'INSTRUCTORS', expected: 'instructor' },
            { audience: 'STUDENTS', expected: 'student' },
        ];

        for (const { audience, expected } of REVERSE_CASES) {
            it(`maps '${audience}' → '${expected}'`, () => {
                const rawEvent = {
                    eventId: 'e1',
                    institutionId: 'i1',
                    title: 'Test',
                    description: null,
                    eventType: 'EVENT' as const,
                    targetAudience: audience as any,
                    startDate: '2026-05-21T00:00:00Z',
                    endDate: null,
                    startTime: null,
                    endTime: null,
                    createdBy: 'u1',
                    createdByName: 'Alice',
                    createdAt: '2026-05-21T00:00:00Z',
                    updatedAt: null,
                };

                vi.mocked(useCalendarEventsQuery).mockReturnValue({ data: [rawEvent], isLoading: false } as any);

                const { result } = renderHook(() => useAdminCalendar());
                expect(result.current.events[0].targetAudience).toBe(expected);
            });
        }
    });

    describe('forward mapping: TargetAudience → CalendarEventAudience (API call)', () => {
        const FORWARD_CASES: Array<{ audience: string; expected: string }> = [
            { audience: 'institution', expected: 'ALL' },
            { audience: 'administrator', expected: 'ADMINS' },
            { audience: 'instructor', expected: 'INSTRUCTORS' },
            { audience: 'student', expected: 'STUDENTS' },
        ];

        for (const { audience, expected } of FORWARD_CASES) {
            it(`maps '${audience}' → '${expected}'`, () => {
                const createMutate = vi.fn();
                vi.mocked(useCreateCalendarEventMutation).mockReturnValue({ mutate: createMutate, isPending: false, error: null } as any);

                const { result } = renderHook(() => useAdminCalendar());

                result.current.handleAddEvent({
                    title: 'Test Event',
                    description: '',
                    type: 'event' as const,
                    targetAudience: audience as any,
                    date: new Date('2026-05-21'),
                    startTime: undefined,
                    endTime: undefined,
                });

                expect(createMutate).toHaveBeenCalledWith(
                    expect.objectContaining({ targetAudience: expected }),
                );
            });
        }
    });
});
