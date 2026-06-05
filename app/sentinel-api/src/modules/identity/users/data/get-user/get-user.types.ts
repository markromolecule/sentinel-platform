import { type DbClient } from '@sentinel/db';
import { type SelectQueryBuilder } from 'kysely';

export const DEFAULT_META_ROLE = 'student';
export const INSTRUCTOR_ROLE_NAME = 'instructor';
export const SUPERADMIN_ROLE_NAME = 'superadmin';

export type UserQueryBuilder<T = Record<string, unknown>> = SelectQueryBuilder<any, any, T>;

export type GetUserDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    requesterRole?: string;
    requesterUserId?: string;
    requesterDepartmentId?: string | null;
    requesterCourseId?: string | null;
};

export type GetUserRecord = {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    email: string | null;
    raw_user_meta_data: unknown;
    role_name: string | null;
    student_number: string | null;
    employee_number: string | null;
    department_id: string | null;
    department_code: unknown;
    institution_id: string | null;
    institution_name: string | null;
    course_id: string | null;
    primary_course_name: string | null;
    status: string | null;
    last_seen_at: Date | null;
    instructor_course_ids?: string[];
    instructor_course_names?: string[];
    avatar_url: string | null;
};
