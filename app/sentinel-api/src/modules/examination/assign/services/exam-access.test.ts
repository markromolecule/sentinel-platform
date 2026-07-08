import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { getProctorAssignmentColumnSupport } from '../../exams/helper/exam-schema-compat';
import {
    buildAssignedInstructorExamVisibilityPredicates,
    buildStaffExamVisibilityPredicates,
    getExamAssignmentAccessStatuses,
} from './exam-access.service';

vi.mock('../../exams/helper/exam-schema-compat', async () => {
    const actual = await vi.importActual('../../exams/helper/exam-schema-compat');

    return {
        ...(actual as object),
        getProctorAssignmentColumnSupport: vi.fn(),
    };
});

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
});

describe('exam access predicates', () => {
    beforeEach(() => {
        vi.mocked(getProctorAssignmentColumnSupport).mockResolvedValue({
            assigneeColumn: 'instructor_id',
        } as any);
    });

    it('builds the shared staff visibility contract with public, creator, assignment, share, and classroom paths', async () => {
        const db = createCompilerDb();
        const predicates = await buildStaffExamVisibilityPredicates({
            dbClient: db as any,
            userId: 'user-1',
            institutionId: 'institution-1',
            includePublicInstitutionExams: true,
        });

        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where(sql<boolean>`(${sql.join(predicates, sql` or `)})`)
            .compile();

        expect(compiled.sql).toContain('e.is_public = true');
        expect(compiled.sql).toContain('e.institution_id = $1');
        expect(compiled.sql).toContain('e.created_by = $2');
        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('from proctor_assignments as pa');
        expect(compiled.sql).toContain('classroom_instructor_assignments as cia');
        expect(compiled.sql).toContain('from exam_shares as es');

        void db.destroy();
    });

    it('omits same-institution public access when the flag is disabled', async () => {
        const db = createCompilerDb();
        const predicates = await buildStaffExamVisibilityPredicates({
            dbClient: db as any,
            userId: 'user-1',
            institutionId: 'institution-1',
            includePublicInstitutionExams: false,
        });

        const compiled = db
            .selectFrom('exams as e')
            .select('e.exam_id')
            .where(sql<boolean>`(${sql.join(predicates, sql` or `)})`)
            .compile();

        expect(compiled.sql).not.toContain('e.is_public = true');
        expect(compiled.sql).toContain('e.created_by = $1');
        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('from proctor_assignments as pa');
        expect(compiled.sql).toContain('classroom_instructor_assignments as cia');
        expect(compiled.sql).toContain('from exam_shares as es');

        void db.destroy();
    });

    it('builds assignment-only predicates without creator, share, or public fallback', async () => {
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

        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('from proctor_assignments as pa');
        expect(compiled.sql).toContain('classroom_instructor_assignments as cia');
        expect(compiled.sql).not.toContain('e.created_by');
        expect(compiled.sql).not.toContain('exam_shares');
        expect(compiled.sql).not.toContain('e.is_public');

        void db.destroy();
    });
});
