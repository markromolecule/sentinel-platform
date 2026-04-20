import { sql } from 'kysely';

export function buildClassroomExamFilter(args: { classroomId: string; hasSectionId: boolean }) {
    const { classroomId, hasSectionId } = args;

    return sql<boolean>`(
        e.class_group_id = ${classroomId}
        or exists (
            select 1
            from class_groups as target_cg
            left join subject_offerings as target_so
                on target_so.subject_offering_id = target_cg.subject_offering_id
            where target_cg.class_group_id = ${classroomId}
              and target_cg.institution_id is not distinct from e.institution_id
              and coalesce(target_cg.subject_id, target_so.subject_id) = e.subject_id
              and exists (
                  select 1
                  from exam_assigned_sections as eas
                  where eas.exam_id = e.exam_id
                    and eas.section_id = target_cg.section_id
              )
        )
        or (
            e.class_group_id is null
            and exists (
                select 1
                from class_groups as target_cg
                left join subject_offerings as target_so
                    on target_so.subject_offering_id = target_cg.subject_offering_id
                where target_cg.class_group_id = ${classroomId}
                  and target_cg.institution_id is not distinct from e.institution_id
                  and coalesce(target_cg.subject_id, target_so.subject_id) = e.subject_id
                  and (
                      ${
                          hasSectionId
                              ? sql`e.section_id is null or target_cg.section_id = e.section_id`
                              : sql`true`
                      }
                      or exists (
                          select 1
                          from exam_assigned_sections as eas
                          where eas.exam_id = e.exam_id
                            and eas.section_id = target_cg.section_id
                      )
                  )
            )
        )
    )`;
}

export function buildStudentExamVisibilityPredicate(args: {
    studentUserId: string;
    hasSectionId: boolean;
}) {
    const { studentUserId, hasSectionId } = args;

    return sql<boolean>`exists (
        select 1
        from students as st
        inner join enrollments as enr on enr.student_id = st.student_id
        inner join class_groups as student_cg on student_cg.class_group_id = enr.class_group_id
        left join subject_offerings as student_so
            on student_so.subject_offering_id = student_cg.subject_offering_id
        where st.user_id = ${studentUserId}
          and (
              (e.class_group_id is not null and enr.class_group_id = e.class_group_id)
              or (
                  coalesce(student_cg.subject_id, student_so.subject_id) = e.subject_id
                  and exists (
                      select 1
                      from exam_assigned_sections as eas
                      where eas.exam_id = e.exam_id
                        and eas.section_id = student_cg.section_id
                  )
              )
              or (
                  e.class_group_id is null
                  and coalesce(student_cg.subject_id, student_so.subject_id) = e.subject_id
                  and (
                      ${
                          hasSectionId
                              ? sql`e.section_id is null or student_cg.section_id = e.section_id`
                              : sql`true`
                      }
                      or exists (
                          select 1
                          from exam_assigned_sections as eas
                          where eas.exam_id = e.exam_id
                            and eas.section_id = student_cg.section_id
                      )
                  )
              )
          )
    )`;
}
