import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { deleteSectionData } from '../data/delete-section';
import { hideInheritedRecord } from '../../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { SECTION_INHERITANCE_CONFIG } from './_utils';

export type DeleteSectionServiceArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Deletes a section. When the section is inherited, it is hidden instead of
 * physically deleted. Throws HTTP 409 if the section has linked records.
 *
 * @param args.dbClient - Database client
 * @param args.id - Section ID to delete
 * @param args.institutionId - Institution context for scoped operations
 * @param args.actorUserId - ID of the user performing the deletion
 * @returns The hidden or deleted section record
 */
export async function deleteSectionService({
    dbClient,
    id,
    institutionId,
    actorUserId,
}: DeleteSectionServiceArgs) {
    try {
        const hiddenSection = await hideInheritedRecord({
            dbClient,
            config: SECTION_INHERITANCE_CONFIG,
            id,
            institutionId,
        });

        if (hiddenSection) {
            if (hiddenSection.hidden_by && institutionId) {
                await ActivityNotificationService.notifySectionDeleted({
                    dbClient,
                    actorUserId: hiddenSection.hidden_by,
                    institutionId,
                    sectionId: hiddenSection.section_id,
                    sectionLabel: hiddenSection.section_name,
                });
            }

            return hiddenSection;
        }

        const deletedSection = await deleteSectionData({
            dbClient,
            id,
            institutionId,
        });

        if (institutionId) {
            await ActivityNotificationService.notifySectionDeleted({
                dbClient,
                actorUserId: actorUserId ?? id,
                institutionId,
                sectionId: deletedSection.section_id,
                sectionLabel: deletedSection.section_name,
            });
        }

        return deletedSection;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2003' || code === '23503') {
            throw new HTTPException(409, {
                message: 'Cannot delete section because it is currently linked to other records.',
            });
        }
        throw error;
    }
}

export type DeleteSectionServiceResponse = Awaited<ReturnType<typeof deleteSectionService>>;
