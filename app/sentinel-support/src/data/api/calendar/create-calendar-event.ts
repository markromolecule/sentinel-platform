import { apiClient } from '../client';
import {
    type CalendarEventResponse,
    type ApiResponse,
    type CalendarEventType,
    type CalendarEventAudience,
} from '@sentinel/shared';

export interface CreateCalendarEventPayload {
    title: string;
    description?: string;
    eventType: CalendarEventType;
    targetAudience: CalendarEventAudience;
    startDate: string; // ISO 8601 string
    endDate?: string; // ISO 8601 string
    startTime?: string;
    endTime?: string;
}

/**
 * Creates a new system event, announcement, or holiday in the database.
 */
export async function createCalendarEventData(
    payload: CreateCalendarEventPayload,
): Promise<CalendarEventResponse> {
    const response = (await apiClient('/calendar', {
        method: 'POST',
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
        throw new Error(response.error || 'Failed to create calendar event');
    }

    return response.data!;
}
