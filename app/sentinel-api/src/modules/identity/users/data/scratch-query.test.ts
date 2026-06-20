import { describe, it } from 'vitest';
import { dbClient } from '@sentinel/db';
import { getInstructorDashboardData } from './get-instructor-dashboard-data';

describe('Diagnostic Database Queries', () => {
    it('queries instructor Keanna and retrieves counts', async () => {
        const user = await dbClient
            .selectFrom('user_profiles')
            .selectAll()
            .where('first_name', 'ilike', 'Keanna%')
            .executeTakeFirst();

        if (!user) {
            console.log('User Keanna not found');
            return;
        }

        const requesterUserId = user.user_id;
        const institutionId = user.institution_id || undefined;

        console.log('Calling getInstructorDashboardData for user:', requesterUserId, 'institution:', institutionId);
        const result = await getInstructorDashboardData({
            dbClient,
            requesterUserId,
            institutionId,
        });

        console.log('--- DASHBOARD DATA RESULT ---');
        console.log(JSON.stringify(result, null, 2));
    });
});
