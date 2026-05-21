import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from './calendar-write.service';
import * as queryService from './calendar-query.service';
import * as dataLayer from '../data';
import { NotificationService } from '../../notification/notification.service';

vi.mock('./calendar-query.service', () => ({
    getCalendarEventById: vi.fn(),
}));

vi.mock('../data', () => ({
    createCalendarEventData: vi.fn(),
    updateCalendarEventData: vi.fn(),
    deleteCalendarEventData: vi.fn(),
}));

vi.mock('../../notification/notification.service', () => ({
    NotificationService: {
        createNotification: vi.fn(),
    },
}));

describe('calendar-write.service', () => {
    const mockDbClient = {
        selectFrom: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        execute: vi.fn(),
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createCalendarEvent', () => {
        it('should create an event and return fully hydrated record', async () => {
            const payload = {
                title: 'New Event',
                startDate: '2026-05-20T00:00:00Z',
                targetAudience: 'ALL',
            } as any;
            const insertResult = { event_id: 'new-id' } as any;
            const mockHydratedRecord = {
                event_id: 'new-id',
                title: 'New Event',
                created_by_name: 'John Doe',
            } as any;

            vi.mocked(dataLayer.createCalendarEventData).mockResolvedValue(insertResult);
            vi.mocked(queryService.getCalendarEventById).mockResolvedValue(mockHydratedRecord);
            mockDbClient.execute
                .mockResolvedValueOnce([]) // for institutions branches query
                .mockResolvedValueOnce([]); // for recipient user_profiles query

            const result = await createCalendarEvent({
                dbClient: mockDbClient,
                payload,
                userId: 'user-1',
                institutionId: 'inst-1',
            });

            expect(dataLayer.createCalendarEventData).toHaveBeenCalledWith(mockDbClient, {
                payload,
                createdBy: 'user-1',
                institutionId: 'inst-1',
            });
            expect(queryService.getCalendarEventById).toHaveBeenCalledWith(mockDbClient, {
                eventId: 'new-id',
                institutionId: 'inst-1',
            });
            expect(result).toEqual(mockHydratedRecord);
        });

        it('should create an event, query branches and dispatch notifications', async () => {
            const payload = {
                title: 'New Event',
                startDate: '2026-05-20T00:00:00Z',
                targetAudience: 'STUDENTS',
            } as any;
            const insertResult = { event_id: 'new-id' } as any;
            const mockHydratedRecord = {
                event_id: 'new-id',
                title: 'New Event',
                created_by_name: 'John Doe',
            } as any;

            vi.mocked(dataLayer.createCalendarEventData).mockResolvedValue(insertResult);
            vi.mocked(queryService.getCalendarEventById).mockResolvedValue(mockHydratedRecord);
            mockDbClient.execute
                .mockResolvedValueOnce([{ id: 'child-inst-1' }]) // branches
                .mockResolvedValueOnce([{ userId: 'recipient-1' }, { userId: 'recipient-2' }]); // recipients

            const result = await createCalendarEvent({
                dbClient: mockDbClient,
                payload,
                userId: 'user-1',
                institutionId: 'parent-inst-1',
            });

            expect(result).toEqual(mockHydratedRecord);
            expect(mockDbClient.selectFrom).toHaveBeenNthCalledWith(1, 'institutions');
            expect(mockDbClient.selectFrom).toHaveBeenNthCalledWith(2, 'user_profiles as up');
            expect(NotificationService.createNotification).toHaveBeenCalledTimes(2);
            expect(NotificationService.createNotification).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    recipientUserId: 'recipient-1',
                    actorUserId: 'user-1',
                    institutionId: 'parent-inst-1',
                    title: 'New Calendar Event: New Event',
                    actionType: 'INSTITUTION_ACTIVITY_CREATED',
                    resourceType: 'INSTITUTION_ACTIVITY',
                    resourceId: 'new-id',
                }),
            );
        });
    });

    describe('updateCalendarEvent', () => {
        it('should verify event existence, update it, and return updated hydrated record', async () => {
            const payload = { title: 'Updated Title' } as any;
            const originalRecord = { event_id: 'evt-1', institution_id: 'inst-1' } as any;
            const updatedRecord = {
                event_id: 'evt-1',
                title: 'Updated Title',
                created_by_name: 'John Doe',
            } as any;

            vi.mocked(queryService.getCalendarEventById)
                .mockResolvedValueOnce(originalRecord) // 1. ownership check
                .mockResolvedValueOnce(updatedRecord); // 3. hydration after update

            const result = await updateCalendarEvent({
                dbClient: mockDbClient,
                eventId: 'evt-1',
                payload,
                userId: 'user-1',
                institutionId: 'inst-1',
            });

            expect(queryService.getCalendarEventById).toHaveBeenNthCalledWith(1, mockDbClient, {
                eventId: 'evt-1',
                institutionId: 'inst-1',
            });
            expect(dataLayer.updateCalendarEventData).toHaveBeenCalledWith(mockDbClient, {
                eventId: 'evt-1',
                payload,
                updatedBy: 'user-1',
            });
            expect(queryService.getCalendarEventById).toHaveBeenNthCalledWith(2, mockDbClient, {
                eventId: 'evt-1',
                institutionId: 'inst-1',
            });
            expect(result).toEqual(updatedRecord);
        });
    });

    describe('deleteCalendarEvent', () => {
        it('should verify event existence and delete it if the user is the creator', async () => {
            const mockEvent = {
                eventId: 'evt-1',
                institutionId: 'inst-1',
                eventType: 'EVENT',
                createdBy: 'creator-user',
            } as any;
            vi.mocked(queryService.getCalendarEventById).mockResolvedValue(mockEvent);
            const mockDeleteData = vi.fn().mockResolvedValue(undefined);

            const result = await deleteCalendarEvent({
                dbClient: mockDbClient,
                eventId: 'evt-1',
                institutionId: 'inst-1',
                userId: 'creator-user',
                hasDeletePermission: true,
                dependencies: { deleteCalendarEventData: mockDeleteData },
            });

            expect(queryService.getCalendarEventById).toHaveBeenCalledWith(mockDbClient, {
                eventId: 'evt-1',
                institutionId: 'inst-1',
            });
            expect(mockDeleteData).toHaveBeenCalledWith(mockDbClient, {
                eventId: 'evt-1',
                institutionId: 'inst-1',
            });
            expect(result).toBeNull();
        });

        it('should throw a forbidden error if a user tries to delete an event they did not create', async () => {
            const mockEvent = {
                eventId: 'evt-2',
                eventType: 'ANNOUNCEMENT',
                createdBy: 'creator-user',
            } as any;
            vi.mocked(queryService.getCalendarEventById).mockResolvedValue(mockEvent);
            const mockDeleteData = vi.fn();

            await expect(
                deleteCalendarEvent({
                    dbClient: mockDbClient,
                    eventId: 'evt-2',
                    institutionId: 'inst-1',
                    userId: 'non-creator-user',
                    hasDeletePermission: true,
                    dependencies: { deleteCalendarEventData: mockDeleteData },
                }),
            ).rejects.toThrow(
                '403|Forbidden. You do not have permission to delete this calendar event as you are not the creator.',
            );

            expect(queryService.getCalendarEventById).toHaveBeenCalledWith(mockDbClient, {
                eventId: 'evt-2',
                institutionId: 'inst-1',
            });
            expect(mockDeleteData).not.toHaveBeenCalled();
        });
    });
});
