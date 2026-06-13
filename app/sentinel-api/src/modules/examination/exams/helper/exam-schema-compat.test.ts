import { describe, expect, it, vi } from 'vitest';
import {
    getExamColumnSupport,
    getExamQuestionColumnSupport,
    getProctorAssignmentColumnSupport,
} from './exam-schema-compat';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';

function createMockDb(rows: any[]) {
    const db = new Kysely<any>({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });

    vi.spyOn(db.getExecutor(), 'executeQuery').mockResolvedValue({
        rows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return db;
}

describe('exam-schema-compat helpers with Kysely mock', () => {
    it('should query exam columns and return true if present', async () => {
        const mockDb = createMockDb([
            { column_name: 'section_id' },
            { column_name: 'section_name' },
            { column_name: 'room_id' },
        ]);

        const result = await getExamColumnSupport(mockDb as any);
        expect(result).toEqual({
            hasSectionId: true,
            hasSectionName: true,
            hasRoomId: true,
        });
    });

    it('should query exam question columns', async () => {
        const mockDb = createMockDb([{ column_name: 'source_collection_id' }]);

        const result = await getExamQuestionColumnSupport(mockDb as any);
        expect(result).toEqual({
            hasSourceCollectionId: true,
        });
    });

    it('should query proctor assignment columns', async () => {
        const mockDb = createMockDb([{ column_name: 'instructor_id' }]);

        const result = await getProctorAssignmentColumnSupport(mockDb as any);
        expect(result).toEqual({
            assigneeColumn: 'instructor_id',
        });
    });

    it('should handle db query failures and return defaults', async () => {
        const db = new Kysely<any>({
            dialect: {
                createAdapter: () => new PostgresAdapter(),
                createDriver: () => new DummyDriver(),
                createIntrospector: (db) => new PostgresIntrospector(db),
                createQueryCompiler: () => new PostgresQueryCompiler(),
            },
        });
        vi.spyOn(db.getExecutor(), 'executeQuery').mockRejectedValue(new Error('DB Query Error'));

        const result = await getExamColumnSupport(db as any);
        expect(result).toEqual({
            hasSectionId: false,
            hasSectionName: false,
            hasRoomId: false,
        });
    });
});
