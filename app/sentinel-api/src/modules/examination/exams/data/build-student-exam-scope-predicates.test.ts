import { describe, expect, it } from 'vitest';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import {
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
            .where(
                buildClassroomExamFilter({
                    classroomId: '1f2f6f2f-3d7d-4db0-b76a-79c570f17b11',
                    hasSectionId: true,
                }),
            )
            .compile();

        expect(compiled.sql).toContain('e.class_group_id = $1');
        expect(compiled.sql).toContain('from exam_assigned_sections as eas');
        expect(compiled.sql).toContain('e.class_group_id is null');
        expect(compiled.sql).toContain('target_cg.class_group_id = $2');
        expect(compiled.sql).toContain('target_cg.section_id = e.section_id');

        void db.destroy();
    });

    it('only falls back to subject and section matching when the exam has no classroom id', () => {
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

        expect(compiled.sql).toContain('enr.class_group_id = e.class_group_id');
        expect(compiled.sql).toContain('from exam_assigned_sections as eas');
        expect(compiled.sql).toContain('e.class_group_id is null');
        expect(compiled.sql).toContain('coalesce(student_cg.subject_id, student_so.subject_id)');
        expect(compiled.sql).toContain('student_cg.section_id = e.section_id');

        void db.destroy();
    });
});
