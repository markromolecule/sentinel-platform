import { describe, expect, it, vi } from 'vitest';
import { deleteNotifications } from './notifications';

describe('deleteNotifications', () => {
    it('sends a scoped bulk delete request to the notifications endpoint', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            data: {
                message: 'Notifications deleted successfully',
                count: 2,
            },
        });

        const result = await deleteNotifications(apiClient, [
            '11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222',
        ]);

        expect(apiClient).toHaveBeenCalledWith('/notifications/bulk', {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                notificationIds: [
                    '11111111-1111-1111-1111-111111111111',
                    '22222222-2222-2222-2222-222222222222',
                ],
            }),
        });
        expect(result).toEqual({
            message: 'Notifications deleted successfully',
            count: 2,
        });
    });
});
