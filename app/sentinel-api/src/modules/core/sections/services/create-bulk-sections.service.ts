import { type DbClient } from '@sentinel/db';
import { createSectionsData } from '../data/create-section';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type CreateBulkSectionsServiceArgs = {
    dbClient: DbClient;
    data: {
        institutionId: string;
        department_id?: string | null;
        course_id?: string | null;
        sections: {
            name: string;
            year_level?: number;
        }[];
        created_by?: string;
    };
};

/**
 * Creates multiple sections in a single operation and fires a single bulk
 * activity notification for the actor.
 *
 * @param args.dbClient - Database client
 * @param args.data - Bulk creation payload including institution and optional scope
 * @returns A promise resolving to the created sections
 */
export async function createBulkSectionsService({ dbClient, data }: CreateBulkSectionsServiceArgs) {
    const sections = await createSectionsData({
        dbClient,
        values: data.sections.map((s) => ({
            section_name: s.name,
            department_id: data.department_id ?? null,
            course_id: data.course_id ?? null,
            year_level: s.year_level ?? null,
            created_by: data.created_by,
            institution_id: data.institutionId,
        })),
    });

    if (data.created_by) {
        await ActivityNotificationService.notifySectionsBulkCreated({
            dbClient,
            actorUserId: data.created_by,
            institutionId: data.institutionId,
            count: sections.length,
        });
    }

    return sections;
}

export type CreateBulkSectionsServiceResponse = Awaited<
    ReturnType<typeof createBulkSectionsService>
>;
