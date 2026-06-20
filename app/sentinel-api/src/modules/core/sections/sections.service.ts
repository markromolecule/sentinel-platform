import { type DbClient } from '@sentinel/db';
import { getSectionsService } from './services/get-sections.service';
import { createSectionService } from './services/create-section.service';
import { createBulkSectionsService } from './services/create-bulk-sections.service';
import { updateSectionService } from './services/update-section.service';
import { deleteSectionService } from './services/delete-section.service';
import { deleteSectionsService } from './services/delete-sections.service';

export class SectionService {
    /**
     * @deprecated Use getSectionsService directly
     */
    static async getSections(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        scope?: {
            departmentId?: string;
            courseId?: string;
        },
    ) {
        return getSectionsService({ dbClient, institutionId, search, scope });
    }

    /**
     * @deprecated Use createSectionService directly
     */
    static async createSection(
        dbClient: DbClient,
        data: {
            name: string;
            institutionId: string;
            department_id?: string | null;
            course_id?: string | null;
            year_level?: number;
            created_by?: string;
        },
    ) {
        return createSectionService({ dbClient, data });
    }

    /**
     * Creates multiple sections in a single operation.
     *
     * @deprecated Use createBulkSectionsService directly
     * @param dbClient - Database client
     * @param data - Bulk creation payload including institution and optional scope
     * @returns A promise resolving to the created sections
     */
    static async createBulkSections(
        dbClient: DbClient,
        data: {
            institutionId: string;
            department_id?: string | null;
            course_id?: string | null;
            sections: {
                name: string;
                year_level?: number;
            }[];
            created_by?: string;
        },
    ) {
        return createBulkSectionsService({ dbClient, data });
    }

    /**
     * @deprecated Use updateSectionService directly
     */
    static async updateSection(
        dbClient: DbClient,
        id: string,
        data: {
            name?: string;
            department_id?: string | null;
            course_id?: string | null;
            year_level?: number;
            updated_by?: string;
            institutionId?: string;
        },
    ) {
        return updateSectionService({ dbClient, id, data });
    }

    /**
     * @deprecated Use deleteSectionService directly
     */
    static async deleteSection(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        return deleteSectionService({ dbClient, id, institutionId, actorUserId });
    }

    /**
     * @deprecated Use deleteSectionsService directly
     */
    static async deleteSections(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        return deleteSectionsService({ dbClient, ids, institutionId, actorUserId });
    }
}
