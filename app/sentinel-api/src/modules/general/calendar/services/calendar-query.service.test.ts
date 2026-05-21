import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { getCalendarEvents, getCalendarEventById } from './calendar-query.service';
import * as dataLayer from '../data';

vi.mock('../data', () => ({
    getCalendarEventsData: vi.fn(),
    getCalendarEventByIdData: vi.fn(),
}));

describe('calendar-query.service', () => {
    const mockDbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCalendarEvents', () => {
        it('should retrieve list of calendar events from the data layer', async () => {
            const expectedEvents = [{ event_id: '1', title: 'Exam 1' }] as any;
            vi.mocked(dataLayer.getCalendarEventsData).mockResolvedValue(expectedEvents);

            const result = await getCalendarEvents(mockDbClient, {
                institutionId: 'inst-123',
                month: '05',
                year: '2026',
            });

            expect(dataLayer.getCalendarEventsData).toHaveBeenCalledWith(mockDbClient, {
                institutionId: 'inst-123',
                month: '05',
                year: '2026',
            });
            expect(result).toEqual(expectedEvents);
        });
    });

    describe('getCalendarEventById', () => {
        it('should return a calendar event if found and owned by the institution', async () => {
            const mockEvent = { event_id: 'evt-1', institution_id: 'inst-123', title: 'Holiday' } as any;
            vi.mocked(dataLayer.getCalendarEventByIdData).mockResolvedValue(mockEvent);

            const result = await getCalendarEventById(mockDbClient, {
                eventId: 'evt-1',
                institutionId: 'inst-123',
            });

            expect(dataLayer.getCalendarEventByIdData).toHaveBeenCalledWith(mockDbClient, {
                eventId: 'evt-1',
                institutionId: 'inst-123',
            });
            expect(result).toEqual(mockEvent);
        });

        it('should throw a 404 HTTPException if event is not found', async () => {
            vi.mocked(dataLayer.getCalendarEventByIdData).mockResolvedValue(undefined);

            await expect(
                getCalendarEventById(mockDbClient, {
                    eventId: 'non-existent',
                    institutionId: 'inst-123',
                }),
            ).rejects.toThrowError(
                new HTTPException(404, { message: 'Calendar event not found.' }),
            );
        });
    });
});
