import {
    DummyDriver,
    Kysely,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProctorAssignmentColumnSupport } from '../helper/exam-schema-compat';
import { getExamsData } from './get-exams';

vi.mock('../helper/exam-schema-compat', async () => {
    const actual = await vi.importActual('../helper/exam-schema-compat');

    return {
        ...(actual as object),
        getProctorAssignmentColumnSupport: vi.fn(),
    };
});

function createMockDb(metadataRows: any[], dataRows: any[]) {
    const db = new Kysely<any>({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (database) => new PostgresIntrospector(database),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });

    const executeSpy = vi.spyOn(db.getExecutor(), 'executeQuery');

    executeSpy.mockResolvedValueOnce({
        rows: metadataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    executeSpy.mockResolvedValueOnce({
        rows: dataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('getExamsData instructor visibility', () => {
    beforeEach(() => {
        vi.mocked(getProctorAssignmentColumnSupport).mockResolvedValue({
            assigneeColumn: 'instructor_id',
        } as any);
    });

    it('scopes the public instructor predicate to the active institution', async () => {
        const { db, executeSpy } = createMockDb(
            [
                { column_name: 'section_id' },
                { column_name: 'section_name' },
                { column_name: 'room_id' },
            ],
            [],
        );

        await getExamsData({
            dbClient: db as any,
            institutionId: 'institution-1',
            filters: {},
            instructorUserId: 'instructor-1',
        });

        const compiledQuery = executeSpy.mock.calls[1][0];

        expect(compiledQuery.sql).toContain('e.is_public = true');
        expect(compiledQuery.sql).toContain('"e"."institution_id" = $1');
        expect(compiledQuery.sql).toContain('e.created_by =');
        expect(compiledQuery.sql).toContain('from exam_section_assignments as esa');
        expect(compiledQuery.sql).toContain('from proctor_assignments as pa');
        expect(compiledQuery.sql).toContain('classroom_instructor_assignments as cia');
        expect(compiledQuery.sql).toContain('from exam_shares as es');
    });

    it('includes creator, assignment, proctor, share, and classroom ownership paths in staff visibility', async () => {
        const { db, executeSpy } = createMockDb(
            [
                { column_name: 'section_id' },
                { column_name: 'section_name' },
                { column_name: 'room_id' },
            ],
            [],
        );

        await getExamsData({
            dbClient: db as any,
            institutionId: 'institution-1',
            filters: {},
            instructorUserId: 'instructor-1',
        });

        const compiledQuery = executeSpy.mock.calls[1][0];

        expect(compiledQuery.sql).toContain('e.is_public = true');
        expect(compiledQuery.sql).toContain('"e"."institution_id" = $1');
        expect(compiledQuery.sql).toContain('e.created_by =');
        expect(compiledQuery.sql).toContain('from exam_section_assignments as esa');
        expect(compiledQuery.sql).toContain('from proctor_assignments as pa');
        expect(compiledQuery.sql).toContain('from exam_shares as es');
        expect(compiledQuery.sql).toContain('classroom_instructor_assignments as cia');
        expect(compiledQuery.sql).not.toContain('or true');
    });

    it('rejects instructor visibility queries without an institution context', async () => {
        const { db } = createMockDb(
            [
                { column_name: 'section_id' },
                { column_name: 'section_name' },
                { column_name: 'room_id' },
            ],
            [],
        );

        await expect(
            getExamsData({
                dbClient: db as any,
                filters: {},
                instructorUserId: 'instructor-1',
            }),
        ).rejects.toThrow('Institution context required for instructor exam visibility');
    });
});
