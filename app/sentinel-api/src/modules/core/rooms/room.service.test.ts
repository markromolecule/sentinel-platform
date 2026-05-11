import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bulkCreateRoomsService } from './services/bulk-create-rooms.service';
import { createRoomsData } from './data/create-rooms';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

vi.mock('./data/get-rooms', () => ({ getRoomsData: vi.fn() }));
vi.mock('./data/create-room', () => ({ createRoomData: vi.fn() }));
vi.mock('./data/update-room', () => ({ updateRoomData: vi.fn() }));
vi.mock('./data/delete-room', () => ({ deleteRoomData: vi.fn() }));
vi.mock('./data/delete-rooms', () => ({ deleteRoomsData: vi.fn() }));
vi.mock('./data/create-rooms', () => ({ createRoomsData: vi.fn() }));

vi.mock('../../general/notification/services/activity-notification.service', () => ({
    ActivityNotificationService: {
        notifyGenericInstitutionActivity: vi.fn(),
    },
}));

describe('RoomService bulk operations', () => {
    const dbClient = {
        selectFrom: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn(),
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('successfully bulk creates rooms and sends notification', async () => {
        const mockRooms = [
            {
                room_id: 'r1',
                room_name: 'RM400',
                institution_id: 'inst-1',
                room_number: '400',
                room_type: 'LECTURE',
                created_at: new Date(),
                created_by: 'user-1',
            },
            {
                room_id: 'r2',
                room_name: 'RM401',
                institution_id: 'inst-1',
                room_number: '401',
                room_type: 'LECTURE',
                created_at: new Date(),
                created_by: 'user-1',
            },
        ];
        vi.mocked(createRoomsData).mockResolvedValue(mockRooms as any);
        dbClient.executeTakeFirst.mockResolvedValue({ name: 'Test Institution' });

        const result = await bulkCreateRoomsService({
            dbClient,
            data: {
                rooms: [
                    { name: 'RM400', room_number: '400', institution_id: 'inst-1' },
                    { name: 'RM401', room_number: '401', institution_id: 'inst-1' },
                ],
            } as any,
            createdBy: 'user-1',
            institutionId: 'inst-1',
        });

        expect(result).toHaveLength(2);
        expect(result[0].room_name).toBe('RM400');
        expect(ActivityNotificationService.notifyGenericInstitutionActivity).toHaveBeenCalledWith(
            expect.objectContaining({
                operation: 'CREATED',
                targetType: 'ROOM',
                targetLabel: '2 rooms',
            }),
        );
    });
});
