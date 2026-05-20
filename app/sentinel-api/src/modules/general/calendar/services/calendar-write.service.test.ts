import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from './calendar-write.service';
import * as queryService from './calendar-query.service';
import * as dataLayer from '../data';

vi.mock('./calendar-query.service', () => ({
    getCalendarEventById: vi.fn(),
}));

vi.mock('../data', () => ({
    createCalendarEventData: vi.fn(),
    updateCalendarEventData: vi.fn(),
    deleteCalendarEventData: vi.fn(),
}));

describe('calendar-write.service', () => {
    const mockDbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createCalendarEvent', () => {
        it('should create an event and return fully hydrated record', async () => {
            const payload = { title: 'New Event', startDate: '2026-05-20T00:00:00Z' } as any;
            const insertResult = { event_id: 'new-id' } as any;
            const mockHydratedRecord = { event_id: 'new-id', title: 'New Event', created_by_name: 'John Doe' } as any;

            vi.mocked(dataLayer.createCalendarEventData).mockResolvedValue(insertResult);
            vi.mocked(queryService.getCalendarEventById).mockResolvedValue(mockHydratedRecord);

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
    });

    describe('updateCalendarEvent', () => {
        it('should verify event existence, update it, and return updated hydrated record', async () => {
            const payload = { title: 'Updated Title' } as any;
            const originalRecord = { event_id: 'evt-1', institution_id: 'inst-1' } as any;
            const updatedRecord = { event_id: 'evt-1', title: 'Updated Title', created_by_name: 'John Doe' } as any;

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
        it('should verify event existence and delete it', async () => {
            const mockEvent = { event_id: 'evt-1', institution_id: 'inst-1' } as any;
            vi.mocked(queryService.getCalendarEventById).mockResolvedValue(mockEvent);
            const mockDeleteData = vi.fn().mockResolvedValue(undefined);

            const result = await deleteCalendarEvent({
                dbClient: mockDbClient,
                eventId: 'evt-1',
                institutionId: 'inst-1',
                dependencies: { deleteCalendarEventData: mockDeleteData }
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
    });
});
