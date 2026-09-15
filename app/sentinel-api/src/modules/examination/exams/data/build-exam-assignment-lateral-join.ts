import { sql } from 'kysely';

/**
 * Attaches a single consolidated LEFT JOIN LATERAL to an exam query, replacing
 * 7 correlated subqueries against exam_section_assignments with a single pass.
 */
export function withExamAssignmentsLateralJoin<Q extends { leftJoin: (...args: any[]) => any }>(
    query: Q,
    examAlias: string = 'e',
): Q {
    return query.leftJoin(
        sql`lateral (
            select
                coalesce(
                    json_agg(distinct s_inner.section_name order by s_inner.section_name)
                        filter (where s_inner.section_name is not null),
                    '[]'::json
                ) as section_names,
                coalesce(
                    json_agg(distinct esa.section_id order by esa.section_id)
                        filter (where esa.section_id is not null),
                    '[]'::json
                ) as section_ids,
                coalesce(
                    json_agg(distinct esa.class_group_id order by esa.class_group_id)
                        filter (where esa.class_group_id is not null),
                    '[]'::json
                ) as class_group_ids,
                coalesce(
                    json_agg(distinct cg_inner.class_name order by cg_inner.class_name)
                        filter (where cg_inner.class_name is not null),
                    '[]'::json
                ) as class_group_names,
                coalesce(
                    json_agg(distinct r_inner.room_name order by r_inner.room_name)
                        filter (where r_inner.room_name is not null),
                    '[]'::json
                ) as room_names,
                coalesce(
                    json_agg(distinct trim(concat(up_inner.first_name, ' ', up_inner.last_name)) order by trim(concat(up_inner.first_name, ' ', up_inner.last_name)))
                        filter (where up_inner.user_id is not null and trim(concat(up_inner.first_name, ' ', up_inner.last_name)) <> ''),
                    '[]'::json
                ) as instructor_names,
                coalesce(
                    json_agg(distinct esa.instructor_id order by esa.instructor_id)
                        filter (where esa.instructor_id is not null),
                    '[]'::json
                ) as instructor_ids
            from exam_section_assignments as esa
            left join sections as s_inner on s_inner.section_id = esa.section_id
            left join class_groups as cg_inner on cg_inner.class_group_id = esa.class_group_id
            left join rooms as r_inner on r_inner.room_id = esa.room_id
            left join user_profiles as up_inner on up_inner.user_id = esa.instructor_id
            where esa.exam_id = ${sql.ref(`${examAlias}.exam_id`)}
        ) as esa_agg`,
        (join: any) => join.on(sql`true`),
    ) as Q;
}

/**
 * Builds projection selectors for all 7 assignment aggregation fields
 * provided by the esa_agg lateral join.
 */
export function buildExamAssignmentSelects() {
    return [
        sql<string[]>`coalesce(esa_agg.section_names, '[]'::json)`.as('assigned_section_names'),
        sql<string[]>`coalesce(esa_agg.section_ids, '[]'::json)`.as('assigned_section_ids'),
        sql<string[]>`coalesce(esa_agg.class_group_ids, '[]'::json)`.as('assigned_class_group_ids'),
        sql<string[]>`coalesce(esa_agg.class_group_names, '[]'::json)`.as('assigned_class_group_names'),
        sql<string[]>`coalesce(esa_agg.room_names, '[]'::json)`.as('assigned_room_names'),
        sql<string[]>`coalesce(esa_agg.instructor_names, '[]'::json)`.as('assigned_instructor_names'),
        sql<string[]>`coalesce(esa_agg.instructor_ids, '[]'::json)`.as('assigned_instructor_ids'),
    ];
}
