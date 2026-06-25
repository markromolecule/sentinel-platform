import { describe, expect, it } from 'vitest';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import {
    buildAssignedInstructorExamVisibilityPredicates,
    getExamAssignmentAccessStatuses,
} from './exam-access';

function createCompilerDb() {
    return new Kysely<any>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: 'postgres://sentinel:sentinel@127.0.0.1:5432/sentinel',
            }),
        }),
    });
}

describe('getExamAssignmentAccessStatuses', () => {
    it('only allows accepted assignees to inherit instructor exam access', () => {
        expect(getExamAssignmentAccessStatuses()).toEqual(['ACCEPTED']);
        expect(getExamAssignmentAccessStatuses()).not.toContain('PENDING');
        expect(getExamAssignmentAccessStatuses()).not.toContain('DECLINED');
    });

    it('builds assignment-only predicates without creator ownership fallback', async () => {
        const db = createCompilerDb();
        const predicates = await buildAssignedInstructorExamVisibilityPredicates({
            dbClient: db as any,
            userId: 'user-1',
        });

        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where(sql<boolean>`(${sql.join(predicates, sql` or `)})`)
            .compile();

        expect(compiled.sql).toMatch(
            /classroom_instructor_assignments as cia|from proctor_assignments as pa/,
        );
        expect(compiled.sql).not.toContain('e.created_by');

        await db.destroy();
    });
});
