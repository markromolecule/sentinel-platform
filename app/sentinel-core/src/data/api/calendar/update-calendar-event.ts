import { apiClient } from '../client';
import {
    type CalendarEventResponse,
    type ApiResponse,
    type CalendarEventType,
    type CalendarEventAudience,
} from '@sentinel/shared';

export interface UpdateCalendarEventPayload {
    eventId: string;
    title?: string;
    description?: string;
    eventType?: CalendarEventType;
    targetAudience?: CalendarEventAudience;
    startDate?: string; // ISO 8601 string
    endDate?: string; // ISO 8601 string
    startTime?: string;
    endTime?: string;
}

/**
 * Updates an existing calendar event by ID.
 */
export async function updateCalendarEventData({
    eventId,
    ...payload
}: UpdateCalendarEventPayload): Promise<CalendarEventResponse> {
    const response = (await apiClient(`/calendar/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })) as {
        success: boolean;
        data?: CalendarEventResponse;
        error?: string;
    };

    if (!response.success) {
        throw new Error(response.error || 'Failed to update calendar event');
    }

    return response.data!;
}
