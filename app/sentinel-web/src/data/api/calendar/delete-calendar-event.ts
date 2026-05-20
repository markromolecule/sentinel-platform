import { apiClient } from '../client';
import { type ApiResponse } from '@sentinel/shared';

/**
 * Deletes a calendar event/note by its event ID.
 */
export async function deleteCalendarEventData({ eventId }: { eventId: string }): Promise<void> {
    const response = (await apiClient(`/calendar/${eventId}`, {
        method: 'DELETE',
    })) as {
        success: boolean;
        error?: string;
    };

    if (!response.success) {
        throw new Error(response.error || 'Failed to delete calendar event');
    }
}
