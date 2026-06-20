import { type DbClient } from '@sentinel/db';
import { createSectionData } from '../data/create-section';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type CreateSectionServiceArgs = {
    dbClient: DbClient;
    data: {
        name: string;
        institutionId: string;
        department_id?: string | null;
        course_id?: string | null;
        year_level?: number;
        created_by?: string;
    };
};

/**
 * Creates a single section and fires an activity notification for the actor.
 *
 * @param args.dbClient - Database client
 * @param args.data - Section creation payload
 * @returns The newly created section record
 */
export async function createSectionService({ dbClient, data }: CreateSectionServiceArgs) {
    const section = await createSectionData({
        dbClient,
        values: {
            section_name: data.name,
            department_id: data.department_id ?? null,
            course_id: data.course_id ?? null,
            year_level: data.year_level ?? null,
            created_by: data.created_by,
            institution_id: data.institutionId,
        },
    });

    if (data.created_by) {
        await ActivityNotificationService.notifySectionCreated({
            dbClient,
            actorUserId: data.created_by,
            institutionId: data.institutionId,
            sectionId: section.section_id,
            sectionLabel: section.section_name,
        });
    }

    return section;
}

export type CreateSectionServiceResponse = Awaited<ReturnType<typeof createSectionService>>;
