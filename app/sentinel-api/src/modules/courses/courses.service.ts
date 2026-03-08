import { getCoursesData } from './data/get-courses';
import { createCourseData } from './data/create-course';
import { getCourseByCodeData } from './data/get-course-by-code';
import { updateCourseData } from './data/update-course';
import { deleteCourseData } from './data/delete-course';
import { type DbClient } from '../../lib/create-db-client';

export class CourseService {
    static async getCourses(dbClient: DbClient, institutionId: string) {
        return await getCoursesData({ dbClient, institutionId });
    }

    static async createCourse(
        dbClient: DbClient,
        data: {
            code: string;
            title: string;
            institutionId: string;
            department_id?: string | null;
            description?: string | null;
            created_by?: string | null;
        },
    ) {
        const existingCourse = await getCourseByCodeData({
            dbClient,
            code: data.code,
            institutionId: data.institutionId,
        });

        if (existingCourse) {
            throw new Error(`Course with code ${data.code} already exists`);
        }

        return await createCourseData({
            dbClient,
            values: {
                code: data.code,
                title: data.title,
                department_id: data.department_id ?? null,
                description: data.description ?? null,
                created_by: data.created_by ?? null,
                institution_id: data.institutionId,
            },
        });
    }

    static async updateCourse(
        dbClient: DbClient,
        id: string,
        data: {
            code?: string;
            title?: string;
            department_id?: string | null;
            description?: string | null;
            updated_by?: string | null;
        },
    ) {
        return await updateCourseData({
            dbClient,
            id,
            values: {
                code: data.code,
                title: data.title,
                department_id: data.department_id !== undefined ? data.department_id : null,
                description: data.description ?? null,
                updated_by: data.updated_by,
                updated_at: new Date().toISOString(),
            },
        });
    }

    static async deleteCourse(dbClient: DbClient, id: string) {
        return await deleteCourseData({
            dbClient,
            id,
        });
    }
}
