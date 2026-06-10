import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteNotificationsData } from './delete-notifications';

function createDeleteQueryMock() {
    const query: any = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        execute: vi.fn(),
    };

    return query;
}

describe('deleteNotificationsData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deletes only notifications owned by the recipient', async () => {
        const query = createDeleteQueryMock();
        query.execute.mockResolvedValue([{ notification_id: 'a' }, { notification_id: 'b' }]);

        const dbClient = {
            deleteFrom: vi.fn(() => query),
        } as any;

        const result = await deleteNotificationsData({
            dbClient,
            recipientUserId: 'recipient-1',
            notificationIds: ['a', 'b', 'c'],
        });

        expect(dbClient.deleteFrom).toHaveBeenCalledWith('notifications');
        expect(query.where).toHaveBeenNthCalledWith(1, 'recipient_user_id', '=', 'recipient-1');
        expect(query.where).toHaveBeenNthCalledWith(2, 'notification_id', 'in', ['a', 'b', 'c']);
        expect(result).toEqual({ deleted_count: 2 });
    });

    it('returns zero when no notification ids are provided', async () => {
        const dbClient = {
            deleteFrom: vi.fn(),
        } as any;

        const result = await deleteNotificationsData({
            dbClient,
            recipientUserId: 'recipient-1',
            notificationIds: [],
        });

        expect(result).toEqual({ deleted_count: 0 });
        expect(dbClient.deleteFrom).not.toHaveBeenCalled();
    });
});
