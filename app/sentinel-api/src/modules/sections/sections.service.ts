import { getSectionsData } from './data/get-sections';
import { createSectionData } from './data/create-section';
import { updateSectionData } from './data/update-section';
import { deleteSectionData } from './data/delete-section';
import { type DbClient } from '../../lib/create-db-client';

export class SectionService {
    static async getSections(dbClient: DbClient) {
        return await getSectionsData({ dbClient });
    }

    static async createSection(
        dbClient: DbClient,
        data: {
            name: string;
            departmentId?: string | null;
            courseId?: string | null;
            yearLevel?: number;
            created_by?: string;
        },
    ) {
        return await createSectionData({
            dbClient,
            values: {
                section_name: data.name,
                department_id: data.departmentId ?? null,
                course_id: data.courseId ?? null,
                year_level: data.yearLevel ?? null,
                created_by: data.created_by,
            },
        });
    }

    static async updateSection(
        dbClient: DbClient,
        id: string,
        data: {
            name?: string;
            departmentId?: string | null;
            courseId?: string | null;
            yearLevel?: number;
            updated_by?: string;
        },
    ) {
        return await updateSectionData({
            dbClient,
            id,
            values: {
                ...(data.name !== undefined ? { section_name: data.name } : {}),
                ...(data.departmentId !== undefined ? { department_id: data.departmentId } : {}),
                ...(data.courseId !== undefined ? { course_id: data.courseId } : {}),
                ...(data.yearLevel !== undefined ? { year_level: data.yearLevel } : {}),
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
