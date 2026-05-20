import { apiClient } from '../client';
import { type CalendarEventResponse, type ApiResponse } from '@sentinel/shared';

export interface GetCalendarEventsParams {
    month: number;
    year: number;
}

/**
 * Fetches all calendar events for a specific month and year from the API.
 */
export async function getCalendarEventsData({
    month,
    year,
}: GetCalendarEventsParams): Promise<CalendarEventResponse[]> {
    const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
    });

    const response = (await apiClient(`/calendar?${params.toString()}`)) as {
        success: boolean;
        data?: CalendarEventResponse[];
        error?: string;
    };

    if (!response.success) {
        throw new Error(response.error || 'Failed to fetch calendar events');
    }

    return response.data!;
}
