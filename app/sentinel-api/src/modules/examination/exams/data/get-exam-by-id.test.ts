import {
    DummyDriver,
    Kysely,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProctorAssignmentColumnSupport } from '../helper/exam-schema-compat';
import { getExamByIdData } from './get-exam-by-id';
import * as examAccessService from '../../assign/services/exam-access.service';

vi.mock('../helper/exam-schema-compat', async () => {
    const actual = await vi.importActual('../helper/exam-schema-compat');

    return {
        ...(actual as object),
        getProctorAssignmentColumnSupport: vi.fn(),
    };
});

function createMockDb(dataRows: any[] = []) {
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
        rows: dataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('getExamByIdData', () => {
    beforeEach(() => {
        vi.mocked(getProctorAssignmentColumnSupport).mockResolvedValue({
            assigneeColumn: 'instructor_id',
        } as any);
    });

    it('includes both legacy and decoupled section assignments in the student visibility query', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamByIdData({
            dbClient: db as any,
            id: 'exam-1',
            institutionId: 'institution-1',
            studentUserId: 'student-1',
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"e"."published_at" is not null');
        expect(compiledQuery.sql).toContain('lower(cast("e"."status" as text)) <>');
        expect(compiledQuery.sql).toContain('from exam_section_assignments');
        expect(compiledQuery.sql).toContain('"student_cg"."section_id"');

        void db.destroy();
    });

    it('aggregates assigned classroom ids and names for exact classroom assignments', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamByIdData({
            dbClient: db as any,
            id: 'exam-1',
            institutionId: 'institution-1',
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('left join lateral (');
        expect(compiledQuery.sql).toContain('as esa_agg on true');
        expect(compiledQuery.sql).toContain('json_agg(distinct esa.class_group_id order by esa.class_group_id)');
        expect(compiledQuery.sql).toContain('left join class_groups as cg_inner on cg_inner.class_group_id = esa.class_group_id');
        expect(compiledQuery.sql).toContain('json_agg(distinct cg_inner.class_name order by cg_inner.class_name)');

        void db.destroy();
    });

    it('keeps published student exam detail visibility scoped to exact classroom assignments with legacy fallback', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamByIdData({
            dbClient: db as any,
            id: 'exam-1',
            institutionId: 'institution-1',
            studentUserId: 'student-1',
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"e"."published_at" is not null');
        expect(compiledQuery.sql).toContain('lower(cast("e"."status" as text)) <>');
        expect(compiledQuery.sql).toContain('enr.class_group_id = e.class_group_id');
        expect(compiledQuery.sql).toContain('esa.class_group_id = "student_cg"."class_group_id"');
        expect(compiledQuery.sql).toContain('esa.class_group_id is null');
        expect(compiledQuery.sql).not.toContain('"e"."is_public" = true');

        void db.destroy();
    });

    it('uses the same published plus assignment visibility gates for student detail queries as the list query', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamByIdData({
            dbClient: db as any,
            id: 'exam-1',
            institutionId: 'institution-1',
            studentUserId: 'student-1',
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"e"."published_at" is not null');
        expect(compiledQuery.sql).toContain('lower(cast("e"."status" as text)) <>');
        expect(compiledQuery.sql).toContain('enr.class_group_id = e.class_group_id');
        expect(compiledQuery.sql).toContain('esa.class_group_id = "student_cg"."class_group_id"');
        expect(compiledQuery.sql).not.toContain('"e"."is_public" = true');

        void db.destroy();
    });

    it('applies staff visibility predicates when a staff actor is supplied', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamByIdData({
            dbClient: db as any,
            id: 'exam-1',
            institutionId: 'institution-1',
            staffUserId: 'staff-1',
            applyStaffVisibility: true,
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('e.is_public = true');
        expect(compiledQuery.sql).toContain('e.created_by =');
        expect(compiledQuery.sql).toContain('from exam_section_assignments as esa');
        expect(compiledQuery.sql).toContain('from proctor_assignments as pa');
        expect(compiledQuery.sql).toContain('from exam_shares as es');
        expect(compiledQuery.sql).toContain('classroom_instructor_assignments as cia');

        void db.destroy();
    });

    it('guards against empty staff visibility predicates by filtering false', async () => {
        const { db, executeSpy } = createMockDb();
        const spy = vi
            .spyOn(examAccessService, 'buildStaffExamVisibilityPredicates')
            .mockResolvedValueOnce([]);

        await getExamByIdData({
            dbClient: db as any,
            id: 'exam-1',
            institutionId: 'institution-1',
            staffUserId: 'staff-1',
            applyStaffVisibility: true,
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('false');
        expect(compiledQuery.sql).not.toContain('or ()');
        expect(spy).toHaveBeenCalled();

        void db.destroy();
    });
});
