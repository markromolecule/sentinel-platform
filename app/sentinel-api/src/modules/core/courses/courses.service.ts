import { type DbClient } from '@sentinel/db';
import { getCoursesService } from './services/get-courses.service';
import { createCourseService } from './services/create-course.service';
import { updateCourseService } from './services/update-course.service';
import { deleteCourseService } from './services/delete-course.service';
import { deleteCoursesService } from './services/delete-courses.service';

export class CourseService {
    /**
     * @deprecated Use getCoursesService directly.
     */
    static async getCourses(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        scope?: {
            departmentId?: string;
            courseId?: string;
            page?: number;
            pageSize?: number;
        },
    ) {
        return getCoursesService({ dbClient, institutionId, search, scope });
    }

    /**
     * @deprecated Use createCourseService directly.
     */
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
        return createCourseService({ dbClient, data });
    }

    /**
     * @deprecated Use updateCourseService directly.
     */
    static async updateCourse(
        dbClient: DbClient,
        id: string,
        data: {
            code?: string;
            title?: string;
            department_id?: string | null;
            description?: string | null;
            updated_by?: string | null;
            institutionId?: string;
        },
    ) {
        return updateCourseService({ dbClient, id, data });
    }

    /**
     * @deprecated Use deleteCourseService directly.
     */
    static async deleteCourse(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        return deleteCourseService({ dbClient, id, institutionId, actorUserId });
    }

    /**
     * @deprecated Use deleteCoursesService directly.
     */
    static async deleteCourses(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        return deleteCoursesService({ dbClient, ids, institutionId, actorUserId });
    }
}
