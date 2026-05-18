import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bulkCreateRoomsService } from './services/bulk-create-rooms.service';
import { createRoomService } from './services/create-room.service';
import { updateRoomService } from './services/update-room.service';
import { createRoomData } from './data/create-room';
import { createRoomsData } from './data/create-rooms';
import { updateRoomData } from './data/update-room';
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

describe('RoomService operations', () => {
    const dbClient = {
        selectFrom: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn(),
        executeTakeFirstOrThrow: vi.fn(),
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('bulkCreateRoomsService', () => {
        it('successfully bulk creates rooms and sends notification', async () => {
            const mockRooms = [
                {
                    room_id: 'r1',
                    room_name: 'RM400',
                    institution_id: 'inst-1',
                    room_number: '400',
                    room_type: 'LECTURE',
                    status: 'AVAILABLE',
                    created_at: new Date(),
                    created_by: 'user-1',
                },
                {
                    room_id: 'r2',
                    room_name: 'RM401',
                    institution_id: 'inst-1',
                    room_number: '401',
                    room_type: 'LECTURE',
                    status: 'ASSIGNED',
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
                        { name: 'RM400', room_number: '400', institution_id: 'inst-1', room_type: 'LECTURE', status: 'AVAILABLE' },
                        { name: 'RM401', room_number: '401', institution_id: 'inst-1', room_type: 'LECTURE', status: 'ASSIGNED' },
                    ],
                } as any,
                createdBy: 'user-1',
                institutionId: 'inst-1',
            });

            expect(result).toHaveLength(2);
            expect(result[0].room_name).toBe('RM400');
            expect(result[0].status).toBe('AVAILABLE');
            expect(result[1].status).toBe('ASSIGNED');
            expect(ActivityNotificationService.notifyGenericInstitutionActivity).toHaveBeenCalledWith(
                expect.objectContaining({
                    operation: 'CREATED',
                    targetType: 'ROOM',
                    targetLabel: '2 rooms',
                }),
            );
        });
    });

    describe('createRoomService', () => {
        it('successfully creates a single room with status', async () => {
            const mockRoom = {
                room_id: 'r1',
                room_name: 'RM500',
                institution_id: 'inst-1',
                room_number: '500',
                room_type: 'LABORATORY',
                status: 'MAINTENANCE',
                created_at: new Date(),
                created_by: 'user-1',
            };
            vi.mocked(createRoomData).mockResolvedValue(mockRoom as any);
            dbClient.executeTakeFirst.mockResolvedValue({ name: 'Test Institution' });

            const result = await createRoomService({
                dbClient,
                data: {
                    name: 'RM500',
                    room_number: '500',
                    room_type: 'LABORATORY',
                    status: 'MAINTENANCE',
                    institution_id: 'inst-1',
                } as any,
                createdBy: 'user-1',
                institutionId: 'inst-1',
            });

            expect(result.room_name).toBe('RM500');
            expect(result.status).toBe('MAINTENANCE');
            expect(createRoomData).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expect.objectContaining({
                        status: 'MAINTENANCE',
                    }),
                }),
            );
        });
    });

    describe('updateRoomService', () => {
        it('successfully updates room status', async () => {
            const mockRoom = {
                room_id: 'r1',
                room_name: 'RM500',
                institution_id: 'inst-1',
                room_number: '500',
                room_type: 'LABORATORY',
                status: 'ASSIGNED',
                created_at: new Date(),
                created_by: 'user-1',
            };
            // Mock the inheritance checks
            dbClient.executeTakeFirstOrThrow.mockResolvedValue({
                id: 'inst-1',
                parent_institution_id: null,
                institution_kind: 'STANDALONE',
            });
            // First select returns the existing record, second select (override existing check) returns null
            dbClient.executeTakeFirst
                .mockResolvedValueOnce({
                    room_id: 'r1',
                    institution_id: 'inst-1',
                    inheritance_status: 'LOCAL',
                })
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ name: 'Test Institution' }); // for getInstitutionName in service

            vi.mocked(updateRoomData).mockResolvedValue(mockRoom as any);

            const result = await updateRoomService({
                dbClient,
                id: 'r1',
                data: {
                    status: 'ASSIGNED',
                } as any,
                updatedBy: 'user-1',
                institutionId: 'inst-1',
            });

            expect(result.status).toBe('ASSIGNED');
            expect(updateRoomData).toHaveBeenCalledWith(
                expect.objectContaining({
                    values: expect.objectContaining({
                        status: 'ASSIGNED',
                    }),
                }),
            );
        });
    });
});
