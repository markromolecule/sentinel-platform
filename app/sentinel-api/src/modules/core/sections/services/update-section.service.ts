import { type DbClient } from '@sentinel/db';
import { updateSectionData } from '../data/update-section';
import {
    upsertInheritedOverride,
} from '../../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { SECTION_INHERITANCE_CONFIG } from './_utils';

export type UpdateSectionServiceArgs = {
    dbClient: DbClient;
    id: string;
    data: {
        name?: string;
        department_id?: string | null;
        course_id?: string | null;
        year_level?: number;
        updated_by?: string;
        institutionId?: string;
    };
};

/**
 * Updates a section record. When the section is inherited, an override is
 * upserted instead of mutating the original. Fires an activity notification
 * after a successful write in either path.
 *
 * @param args.dbClient - Database client
 * @param args.id - Section ID to update
 * @param args.data - Fields to update and actor metadata
 * @returns The updated (or overridden) section record
 */
export async function updateSectionService({ dbClient, id, data }: UpdateSectionServiceArgs) {
    const overrideSection = await upsertInheritedOverride({
        dbClient,
        config: SECTION_INHERITANCE_CONFIG,
        id,
        institutionId: data.institutionId,
        actorId: data.updated_by,
        values: {
            ...(data.name !== undefined ? { section_name: data.name } : {}),
            ...(data.department_id !== undefined ? { department_id: data.department_id } : {}),
            ...(data.course_id !== undefined ? { course_id: data.course_id } : {}),
            ...(data.year_level !== undefined ? { year_level: data.year_level } : {}),
            updated_by: data.updated_by,
            updated_at: new Date(),
        },
    });

    if (overrideSection) {
        if (data.updated_by && data.institutionId) {
            await ActivityNotificationService.notifySectionUpdated({
                dbClient,
                actorUserId: data.updated_by,
                institutionId: data.institutionId,
                sectionId: overrideSection.section_id,
                sectionLabel: overrideSection.section_name,
            });
        }

        return overrideSection;
    }

    const section = await updateSectionData({
        dbClient,
        id,
        values: {
            ...(data.name !== undefined ? { section_name: data.name } : {}),
            ...(data.department_id !== undefined ? { department_id: data.department_id } : {}),
            ...(data.course_id !== undefined ? { course_id: data.course_id } : {}),
            ...(data.year_level !== undefined ? { year_level: data.year_level } : {}),
            updated_by: data.updated_by,
            updated_at: new Date().toISOString(),
        },
        institutionId: data.institutionId,
    });

    if (data.updated_by && data.institutionId) {
        await ActivityNotificationService.notifySectionUpdated({
            dbClient,
            actorUserId: data.updated_by,
            institutionId: data.institutionId,
            sectionId: section.section_id,
            sectionLabel: section.section_name,
        });
    }

    return section;
}

export type UpdateSectionServiceResponse = Awaited<ReturnType<typeof updateSectionService>>;
