import { sql } from 'kysely';

function buildClassroomAssignmentExistsPredicate(args: {
    examAlias: string;
    classroomId: string;
}) {
    const { examAlias, classroomId } = args;

    return sql<boolean>`exists (
        select 1
        from exam_section_assignments as esa
        where esa.exam_id = ${sql.ref(`${examAlias}.exam_id`)}
          and esa.class_group_id = ${sql.ref(`${classroomId}.class_group_id`)}
    )`;
}

function buildSectionAssignmentExistsPredicate(args: {
    examAlias: string;
    sectionAlias: string;
}) {
    const { examAlias, sectionAlias } = args;

    return sql<boolean>`(
        exists (
            select 1
            from exam_assigned_sections as eas
            where eas.exam_id = ${sql.ref(`${examAlias}.exam_id`)}
              and eas.section_id = ${sql.ref(`${sectionAlias}.section_id`)}
        )
        or exists (
            select 1
            from exam_section_assignments as esa
            where esa.exam_id = ${sql.ref(`${examAlias}.exam_id`)}
              and esa.class_group_id is null
              and esa.section_id = ${sql.ref(`${sectionAlias}.section_id`)}
        )
    )`;
}

/**
 * Builds a reusable assigned-section aggregation expression that merges the
 * legacy and current exam section assignment tables for a single exam row.
 */
export function buildAssignedSectionIdsSelect(args: { examAlias: string }) {
    const { examAlias } = args;

    return sql<string[]>`coalesce((
        select array_agg(combined_sections.section_id)
        from (
            select eas.section_id
            from exam_assigned_sections as eas
            where eas.exam_id = ${sql.ref(`${examAlias}.exam_id`)}
            union
            select esa.section_id
            from exam_section_assignments as esa
            where esa.exam_id = ${sql.ref(`${examAlias}.exam_id`)}
        ) as combined_sections
    ), '{}'::uuid[])`;
}

/**
 * Builds classroom exam visibility rules that support direct classroom links
 * and explicit section assignments from both assignment tables.
 */
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
              and (
                  ${buildClassroomAssignmentExistsPredicate({
                      examAlias: 'e',
                      classroomId: 'target_cg',
                  })}
                  or (
                      e.class_group_id is null
                      and
                      ${buildSectionAssignmentExistsPredicate({
                          examAlias: 'e',
                          sectionAlias: 'target_cg',
                      })}
                  )
                  or (
                      e.class_group_id is null
                      and
                      (
                          (
                              e.subject_id is null
                              or coalesce(target_cg.subject_id, target_so.subject_id) = e.subject_id
                          )
                          and (
                              ${
                                  hasSectionId
                                      ? sql`e.section_id is null or target_cg.section_id = e.section_id`
                                      : sql`true`
                              }
                          )
                      )
                  )
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
                  and (
                      ${buildSectionAssignmentExistsPredicate({
                          examAlias: 'e',
                          sectionAlias: 'target_cg',
                      })}
                      or (
                          (
                              e.subject_id is null
                              or coalesce(target_cg.subject_id, target_so.subject_id) = e.subject_id
                          )
                          and (
                              ${
                                  hasSectionId
                                      ? sql`e.section_id is null or target_cg.section_id = e.section_id`
                                      : sql`true`
                              }
                          )
                      )
                  )
            )
        )
    )`;
}

/**
 * Builds student exam visibility rules based on enrollment plus explicit
 * classroom and section assignment links.
 */
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
              or ${buildClassroomAssignmentExistsPredicate({
                  examAlias: 'e',
                  classroomId: 'student_cg',
              })}
              or (
                  e.class_group_id is null
                  and (
                  ${buildSectionAssignmentExistsPredicate({
                      examAlias: 'e',
                      sectionAlias: 'student_cg',
                  })}
                  or (
                      e.subject_id is null
                      or coalesce(student_cg.subject_id, student_so.subject_id) = e.subject_id
                  )
                  and (
                      ${
                          hasSectionId
                              ? sql`e.section_id is null or student_cg.section_id = e.section_id`
                              : sql`true`
                      }
                  )
                  )
              )
          )
    )`;
}
