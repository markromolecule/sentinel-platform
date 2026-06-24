import { describe, expect, it } from 'vitest';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import {
    buildAssignedSectionIdsSelect,
    buildClassroomExamFilter,
    buildStudentExamVisibilityPredicate,
} from './build-student-exam-scope-predicates';

function createCompilerDb() {
    return new Kysely<any>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: 'postgres://sentinel:sentinel@127.0.0.1:5432/sentinel',
            }),
        }),
    });
}

describe('student exam scope predicates', () => {
    it('keeps classroom filtering compatible with legacy exams that predate class_group_id', () => {
        const db = createCompilerDb();
        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where((eb) =>
                buildClassroomExamFilter(eb, {
                    classroomId: '1f2f6f2f-3d7d-4db0-b76a-79c570f17b11',
                    hasSectionId: true,
                }),
            )
            .compile();

        expect(compiled.sql).toContain('e.class_group_id = $1');
        expect(compiled.sql).toContain('esa.class_group_id = "target_cg"."class_group_id"');
        expect(compiled.sql).toContain('from exam_assigned_sections as eas');
        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('esa.class_group_id is null');
        expect(compiled.sql).toContain('e.class_group_id is null');
        expect(compiled.sql).toContain('target_cg.class_group_id = $2');
        expect(compiled.sql).toContain('"target_cg"."section_id"');

        void db.destroy();
    });

    it('only falls back to subject and section matching when the exam has no classroom id', () => {
        const db = createCompilerDb();
        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where((eb) =>
                buildStudentExamVisibilityPredicate(eb, {
                    studentUserId: '4bb7db25-f34f-4a57-b6ae-1db2f898f142',
                    hasSectionId: true,
                }),
            )
            .compile();

        expect(compiled.sql).toContain('enr.class_group_id = e.class_group_id');
        expect(compiled.sql).toContain('esa.class_group_id = "student_cg"."class_group_id"');
        expect(compiled.sql).toContain('from exam_assigned_sections as eas');
        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('esa.class_group_id is null');
        expect(compiled.sql).toContain('e.class_group_id is null');
        expect(compiled.sql).toContain('coalesce(student_cg.subject_id, student_so.subject_id)');
        expect(compiled.sql).toContain('"student_cg"."section_id"');

        void db.destroy();
    });

    it('includes explicit section assignments from the new assignment table in classroom-scoped exams', () => {
        const db = createCompilerDb();
        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where((eb) =>
                buildClassroomExamFilter(eb, {
                    classroomId: '1f2f6f2f-3d7d-4db0-b76a-79c570f17b11',
                    hasSectionId: false,
                }),
            )
            .compile();

        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('esa.class_group_id = "target_cg"."class_group_id"');
        expect(compiled.sql).toContain('"target_cg"."section_id"');
        expect(compiled.sql).toContain(
            'exists (\n            select 1\n            from exam_assigned_sections as eas',
        );

        void db.destroy();
    });

    it('treats explicit section assignments as sufficient even when subject alignment is inconsistent', () => {
        const db = createCompilerDb();
        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where(
                buildStudentExamVisibilityPredicate({
                    studentUserId: '4bb7db25-f34f-4a57-b6ae-1db2f898f142',
                    hasSectionId: true,
                }),
            )
            .compile();

        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('esa.class_group_id is null');
        expect(compiled.sql).toContain('coalesce(student_cg.subject_id, student_so.subject_id)');
        expect(compiled.sql).toContain(
            'and (\n                      e.section_id is null or student_cg.section_id = e.section_id\n                  )',
        );

        void db.destroy();
    });

    it('aggregates assigned section ids from both assignment tables', () => {
        const db = createCompilerDb();
        const compiled = db
            .selectFrom('exams as e')
            .select(buildAssignedSectionIdsSelect({ examAlias: 'e' }).as('assigned_section_ids'))
            .compile();

        expect(compiled.sql).toContain('from exam_assigned_sections as eas');
        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain("'{}'::uuid[]");

        void db.destroy();
    });

    it('keeps private exams enrollment-scoped even when explicitly assigned by section', () => {
        const db = createCompilerDb();
        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where('e.is_public', '=', false)
            .where(
                buildStudentExamVisibilityPredicate({
                    studentUserId: '4bb7db25-f34f-4a57-b6ae-1db2f898f142',
                    hasSectionId: true,
                }),
            )
            .compile();

        expect(compiled.sql).toContain('"e"."is_public" = $1');
        expect(compiled.sql).toContain('from exam_assigned_sections as eas');
        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('from students as st');

        void db.destroy();
    });

    it('keeps public exams enrollment-scoped and does not bypass assignment matching', () => {
        const db = createCompilerDb();
        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where('e.is_public', '=', true)
            .where(
                buildStudentExamVisibilityPredicate({
                    studentUserId: '4bb7db25-f34f-4a57-b6ae-1db2f898f142',
                    hasSectionId: true,
                }),
            )
            .compile();

        expect(compiled.sql).toContain('"e"."is_public" = $1');
        expect(compiled.sql).toContain('from exam_assigned_sections as eas');
        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('enr.class_group_id = e.class_group_id');

        void db.destroy();
    });

    it('prefers exact classroom assignments over same-section matches from other classrooms', () => {
        const db = createCompilerDb();
        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where(
                buildStudentExamVisibilityPredicate({
                    studentUserId: '4bb7db25-f34f-4a57-b6ae-1db2f898f142',
                    hasSectionId: true,
                }),
            )
            .compile();

        expect(compiled.sql).toContain('esa.class_group_id = "student_cg"."class_group_id"');
        expect(compiled.sql).toContain('e.class_group_id is null');
        expect(compiled.sql).not.toContain(
            'where esa.exam_id = "e"."exam_id"\n              and esa.section_id = "student_cg"."section_id"',
        );

        void db.destroy();
    });
});
