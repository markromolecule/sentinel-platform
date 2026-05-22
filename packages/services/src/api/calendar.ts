import {
    CalendarEventResponse,
    CalendarEventType,
    CalendarEventAudience,
} from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

export interface GetCalendarEventsParams {
    month?: number;
    year?: number;
}

export interface CreateCalendarEventPayload {
    title: string;
    description?: string;
    eventType: CalendarEventType;
    targetAudience: CalendarEventAudience;
    startDate: string; // ISO 8601 string or YYYY-MM-DD
    endDate?: string; // ISO 8601 string or YYYY-MM-DD
    startTime?: string;
    endTime?: string;
}

export interface UpdateCalendarEventPayload {
    eventId: string;
    title?: string;
    description?: string;
    eventType?: CalendarEventType;
    targetAudience?: CalendarEventAudience;
    startDate?: string; // ISO 8601 string or YYYY-MM-DD
    endDate?: string; // ISO 8601 string or YYYY-MM-DD
    startTime?: string;
    endTime?: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Fetches calendar events based on optional month and year filters.
 *
 * @param apiClient The API client instance.
 * @param params Optional month and year filters.
 * @returns A promise resolving to an array of calendar events.
 */
export async function getCalendarEvents(
    apiClient: ApiClientType,
    params: GetCalendarEventsParams = {},
): Promise<CalendarEventResponse[]> {
    const queryParams = new URLSearchParams();
    if (params.month !== undefined) {
        queryParams.append('month', String(params.month));
    }
    if (params.year !== undefined) {
        queryParams.append('year', String(params.year));
    }

    const queryString = queryParams.toString();
    const endpoint = `/calendar${queryString ? `?${queryString}` : ''}`;

    const response = (await apiClient(endpoint, {
        method: 'GET',
    })) as ApiResponse<CalendarEventResponse[]>;

    if (!response.success) {
        throw new Error(response.error || 'Failed to fetch calendar events');
    }

    return response.data || [];
}

/**
 * Creates a new calendar event (event, announcement, holiday, or note).
 *
 * @param apiClient The API client instance.
 * @param payload The event payload containing details like title, eventType, and targetAudience.
 * @returns A promise resolving to the created calendar event response.
 */
export async function createCalendarEvent(
    apiClient: ApiClientType,
    payload: CreateCalendarEventPayload,
): Promise<CalendarEventResponse> {
    const response = (await apiClient('/calendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })) as ApiResponse<CalendarEventResponse>;

    if (!response.success) {
        throw new Error(response.error || 'Failed to create calendar event');
    }

    return response.data!;
}

/**
 * Updates an existing calendar event by ID.
 *
 * @param apiClient The API client instance.
 * @param payload The update payload containing the eventId and updated details.
 * @returns A promise resolving to the updated calendar event response.
 */
export async function updateCalendarEvent(
    apiClient: ApiClientType,
    { eventId, ...payload }: UpdateCalendarEventPayload,
): Promise<CalendarEventResponse> {
    const response = (await apiClient(`/calendar/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })) as ApiResponse<CalendarEventResponse>;

    if (!response.success) {
        throw new Error(response.error || 'Failed to update calendar event');
    }

    return response.data!;
}

/**
 * Deletes a calendar event/note by its ID.
 *
 * @param apiClient The API client instance.
 * @param params Object containing the eventId to delete.
 * @returns A promise resolving when the deletion is successful.
 */
export async function deleteCalendarEvent(
    apiClient: ApiClientType,
    { eventId }: { eventId: string },
): Promise<void> {
    const response = (await apiClient(`/calendar/${eventId}`, {
        method: 'DELETE',
    })) as ApiResponse<void>;

    if (!response.success) {
        throw new Error(response.error || 'Failed to delete calendar event');
    }
}
