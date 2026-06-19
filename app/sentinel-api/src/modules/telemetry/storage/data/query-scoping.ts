import { sql } from 'kysely';

export type UserQueryScope = {
    role: string;
    userId: string;
    departmentId?: string | null;
    courseId?: string | null;
};

/**
 * Builds the raw SQL boolean expression to filter incident visibility by role boundaries.
 */
export function buildIncidentScopingPredicate(userScope: UserQueryScope) {
    const { role, userId, departmentId, courseId } = userScope;

    // Support role has global administrative access
    if (role === 'support') {
        return sql<boolean>`true`;
    }

    // Superadmin is scoped to their department
    if (role === 'superadmin') {
        if (!departmentId) {
            return sql<boolean>`false`;
        }
        return sql<boolean>`(
            e.exam_id is not null and (
                exists (
                    select 1 from sections as sec
                    where sec.section_id = e.section_id
                      and sec.department_id = ${departmentId}
                ) or exists (
                    select 1 from class_groups as cg
                    inner join sections as sec_cg on sec_cg.section_id = cg.section_id
                    where cg.class_group_id = e.class_group_id
                      and sec_cg.department_id = ${departmentId}
                ) or exists (
                    select 1 from exam_assigned_sections as eas
                    inner join sections as sec_eas on sec_eas.section_id = eas.section_id
                    where eas.exam_id = e.exam_id
                      and sec_eas.department_id = ${departmentId}
                ) or exists (
                    select 1 from exam_section_assignments as esa
                    inner join sections as sec_esa on sec_esa.section_id = esa.section_id
                    where esa.exam_id = e.exam_id
                      and sec_esa.department_id = ${departmentId}
                )
            )
        )`;
    }

    // Admin is scoped to their course
    if (role === 'admin') {
        if (!courseId) {
            return sql<boolean>`false`;
        }
        return sql<boolean>`(
            e.exam_id is not null and (
                exists (
                    select 1 from sections as sec
                    where sec.section_id = e.section_id
                      and sec.course_id = ${courseId}
                ) or exists (
                    select 1 from class_groups as cg
                    inner join sections as sec_cg on sec_cg.section_id = cg.section_id
                    where cg.class_group_id = e.class_group_id
                      and sec_cg.course_id = ${courseId}
                ) or exists (
                    select 1 from exam_assigned_sections as eas
                    inner join sections as sec_eas on sec_eas.section_id = eas.section_id
                    where eas.exam_id = e.exam_id
                      and sec_eas.course_id = ${courseId}
                ) or exists (
                    select 1 from exam_section_assignments as esa
                    inner join sections as sec_esa on sec_esa.section_id = esa.section_id
                    where esa.exam_id = e.exam_id
                      and sec_esa.course_id = ${courseId}
                )
            )
        )`;
    }

    // Instructor is restricted to owned, assigned, or shared exams
    if (role === 'instructor') {
        return sql<boolean>`(
            e.exam_id is not null and (
                e.created_by = ${userId}
                or exists (
                    select 1 from exam_section_assignments as esa
                    where esa.exam_id = e.exam_id
                      and esa.instructor_id = ${userId}
                ) or exists (
                    select 1 from proctor_assignments as pa
                    where pa.exam_id = e.exam_id
                      and pa.instructor_id = ${userId}
                ) or exists (
                    select 1 from exam_shares as es
                    where es.exam_id = e.exam_id
                      and es.user_id = ${userId}
                ) or exists (
                    select 1 from classroom_instructor_assignments as cia
                    where cia.class_group_id = e.class_group_id
                      and cia.instructor_user_id = ${userId}
                )
            )
        )`;
    }

    // Default to denying access for other roles
    return sql<boolean>`false`;
}

/**
 * Applies incident visibility scoping to a Kysely query builder.
 */
export function applyIncidentQueryScoping(query: any, userScope?: UserQueryScope) {
    if (!userScope) {
        return query;
    }
    return query.where(buildIncidentScopingPredicate(userScope));
}
