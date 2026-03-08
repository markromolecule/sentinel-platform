import { getSectionsData } from './data/get-sections';
import { createSectionData } from './data/create-section';
import { updateSectionData } from './data/update-section';
import { deleteSectionData } from './data/delete-section';
import { type DbClient } from '../../lib/create-db-client';

export class SectionService {
    static async getSections(dbClient: DbClient, institutionId: string) {
        return await getSectionsData({ dbClient, institutionId });
    }

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
        return await createSectionData({
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
    }

    static async updateSection(
        dbClient: DbClient,
        id: string,
        data: {
            name?: string;
            department_id?: string | null;
            course_id?: string | null;
            year_level?: number;
            updated_by?: string;
        },
    ) {
        return await updateSectionData({
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
        });
    }

    static async deleteSection(dbClient: DbClient, id: string) {
        return await deleteSectionData({
            dbClient,
            id,
        });
    }
}
