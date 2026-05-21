import { dbClient } from '../packages/db/src/create-db-client';
import { createCalendarEventData } from '../app/sentinel-api/src/modules/general/calendar/data/create-calendar-event';

async function test() {
    try {
        const user = await dbClient.selectFrom('users').select('id').executeTakeFirst();
        
        console.log('Testing with institution:', "");
        const result = await createCalendarEventData(dbClient, {
            payload: {
                title: 'TEST_SCRIPT',
                eventType: 'ANNOUNCEMENT',
                targetAudience: 'ALL',
                startDate: '2026-05-20T00:00:00.000Z',
                startTime: '06:00',
                endTime: '17:30',
            },
            institutionId: "", // Empty string
            createdBy: user ? user.id : '00000000-0000-0000-0000-000000000000',
        });
        console.log('Success:', result);
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}

test();
