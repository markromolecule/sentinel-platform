import { apiClient } from '../client';
import { type CalendarEventResponse, type ApiResponse } from '@sentinel/shared';

export interface GetCalendarEventsParams {
    month?: number;
    year?: number;
}

/**
 * Fetches calendar events for a specific month and year.
 * If no parameters are passed, fetches all events.
 */
export async function getCalendarEventsData({ month, year }: GetCalendarEventsParams = {}): Promise<
    CalendarEventResponse[]
> {
    const params = new URLSearchParams();
    if (month !== undefined) {
        params.append('month', String(month));
    }
    if (year !== undefined) {
        params.append('year', String(year));
    }

    const queryString = params.toString();
    const endpoint = `/calendar${queryString ? `?${queryString}` : ''}`;

    const response = (await apiClient(endpoint, {
        method: 'GET',
    })) as {
        success: boolean;
        data?: CalendarEventResponse[];
        error?: string;
    };

    if (!response.success) {
        throw new Error(response.error || 'Failed to fetch calendar events');
    }

    return response.data || [];
}
