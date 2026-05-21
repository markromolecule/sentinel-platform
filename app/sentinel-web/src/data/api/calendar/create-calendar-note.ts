import { apiClient } from '../client';
import { type CalendarEventResponse, type ApiResponse } from '@sentinel/shared';

export interface CreateCalendarNotePayload {
    title: string;
    description?: string;
    startDate: string; // ISO date string (YYYY-MM-DD)
    startTime?: string; // HH:mm:ss format
    endTime?: string; // HH:mm:ss format
}

/**
 * Creates a calendar event of type NOTE targeting the STUDENTS audience.
 */
export async function createCalendarNoteData(
    payload: CreateCalendarNotePayload,
): Promise<CalendarEventResponse> {
    const response = (await apiClient('/calendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...payload,
            eventType: 'NOTE',
            targetAudience: 'STUDENTS',
        }),
    })) as {
        success: boolean;
        data?: CalendarEventResponse;
        error?: string;
    };

    if (!response.success) {
        throw new Error(response.error || 'Failed to create calendar note');
    }

    return response.data!;
}
