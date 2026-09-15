import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getExamsData } from './get-exams';
import { getProctorAssignmentColumnSupport } from '../helper/exam-schema-compat';
import * as examAccessService from '../../assign/services/exam-access.service';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';

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
            createIntrospector: (db) => new PostgresIntrospector(db),
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

describe('getExamsData', () => {
    beforeEach(() => {
        vi.mocked(getProctorAssignmentColumnSupport).mockResolvedValue({
            assigneeColumn: 'instructor_id',
        } as any);
    });

    it('should query exams without department filtering when departmentId is not provided', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        // Should select exam_category
        expect(compiledQuery.sql).toContain('"e"."exam_category"');
        // Should filter by institution_id
        expect(compiledQuery.sql).toContain('"e"."institution_id" = $1');
        // Should NOT contain department filtering subqueries
        expect(compiledQuery.sql).not.toContain('sections as sec');
        expect(compiledQuery.sql).not.toContain('subject_departments as sd');
    });

    it('should query exams with department filtering when departmentId is provided', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
            departmentId: 'dept-456',
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const compiledQuery = executeSpy.mock.calls[0][0];

        // Should select exam_category
        expect(compiledQuery.sql).toContain('"e"."exam_category"');
        // Should contain department filtering subqueries
        expect(compiledQuery.sql).toContain('"sections" as "sec"');
        expect(compiledQuery.sql).toContain('"sections" as "sec_cg"');
        expect(compiledQuery.sql).toContain('"subject_departments" as "sd"');
        expect(compiledQuery.sql).toContain('"sec"."department_id" = $2');
    });

    it('should include assigned_room_names in compiled SQL via consolidated lateral join', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // Lateral join targets exam_section_assignments aliased as esa with lateral join
        expect(compiledQuery.sql).toContain('left join lateral (');
        expect(compiledQuery.sql).toContain('as esa_agg on true');
        expect(compiledQuery.sql).toContain('from exam_section_assignments as esa');
        // Joins rooms table aliased as r_inner
        expect(compiledQuery.sql).toContain('left join rooms as r_inner on r_inner.room_id = esa.room_id');
        // Uses json_agg with distinct on room_name
        expect(compiledQuery.sql).toContain('json_agg(distinct r_inner.room_name order by r_inner.room_name)');
    });

    it('should include assigned_instructor_names in compiled SQL via consolidated lateral join', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // Instructor names aggregated in lateral join via up_inner
        expect(compiledQuery.sql).toContain('left join user_profiles as up_inner on up_inner.user_id = esa.instructor_id');
        expect(compiledQuery.sql).toContain('concat(up_inner.first_name, \' \', up_inner.last_name)');
    });

    it('should aggregate classroom ids from exam section assignments via lateral join', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('json_agg(distinct esa.class_group_id order by esa.class_group_id)');
        expect(compiledQuery.sql).toContain('left join class_groups as cg_inner on cg_inner.class_group_id = esa.class_group_id');
    });

    it('should compile classroom-scoped exam queries with exact classroom matching and legacy section fallback', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: { classroomId: 'classroom-123' },
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('where target_cg.class_group_id = $');
        expect(compiledQuery.sql).toContain('esa.class_group_id = "target_cg"."class_group_id"');
        expect(compiledQuery.sql).toContain('esa.class_group_id is null');
    });

    it('should keep student exam visibility tied to published exact-classroom or legacy section assignments', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
            studentUserId: 'student-123',
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"e"."published_at" is not null');
        expect(compiledQuery.sql).toContain('lower(cast("e"."status" as text)) <>');
        expect(compiledQuery.sql).toContain('enr.class_group_id = e.class_group_id');
        expect(compiledQuery.sql).toContain('esa.class_group_id = "student_cg"."class_group_id"');
        expect(compiledQuery.sql).toContain('esa.class_group_id is null');
        expect(compiledQuery.sql).toContain('from exam_remediation_schedules as ers');
        expect(compiledQuery.sql).toContain('ers.student_id = $');
        expect(compiledQuery.sql).toContain('not exists');
    });

    it('should keep published private classroom-assigned exams visible in student list queries', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
            studentUserId: 'student-123',
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"e"."is_public"');
        expect(compiledQuery.sql).toContain('esa.class_group_id = "student_cg"."class_group_id"');
        expect(compiledQuery.sql).not.toContain('"e"."is_public" = true');
    });

    it('should use the same student assignment gates for list queries without adding a public-only where clause', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
            studentUserId: 'student-123',
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"e"."published_at" is not null');
        expect(compiledQuery.sql).toContain('lower(cast("e"."status" as text)) <>');
        expect(compiledQuery.sql).toContain('enr.class_group_id = e.class_group_id');
        expect(compiledQuery.sql).toContain('esa.class_group_id = "student_cg"."class_group_id"');
        expect(compiledQuery.sql).not.toContain('"e"."is_public" = true');
    });

    it('should include creator/publisher joins, is_public selection, and instructorUserId filters in SQL', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
            instructorUserId: 'instructor-123',
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // Should join user_profiles for creator and publisher
        expect(compiledQuery.sql).toContain('"user_profiles" as "up_creator"');
        expect(compiledQuery.sql).toContain('"user_profiles" as "up_publisher"');
        // Should select e.is_public
        expect(compiledQuery.sql).toContain('"e"."is_public"');
        // Should filter by instructorUserId
        expect(compiledQuery.sql).toContain('e.created_by =');
    });

    it('applies default limit and offset when not specified in filters', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // Should apply default limit of 50 and offset of 0
        expect(compiledQuery.sql).toContain('limit $2 offset $3');
        expect(compiledQuery.parameters).toContain(50);
        expect(compiledQuery.parameters).toContain(0);
    });

    it('respects limit and page overrides from filters', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {
                limit: 20,
                page: 3,
            },
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // limit = 20, page = 3 => offset = (3-1)*20 = 40
        expect(compiledQuery.sql).toContain('limit $2 offset $3');
        expect(compiledQuery.parameters).toContain(20);
        expect(compiledQuery.parameters).toContain(40);
    });

    it('applies direct enum status filtering before pagination', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {
                status: 'draft',
                limit: 20,
                page: 1,
            },
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"e"."status" =');
        expect(compiledQuery.sql).toContain('limit');
        expect(compiledQuery.parameters).toContain('DRAFT');
    });

    it('prunes students_count and incident_count correlated subqueries when studentUserId is present', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            studentUserId: 'student-usr-789',
            filters: {},
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // Should use static null projections instead of correlated subqueries
        expect(compiledQuery.sql).toContain('null as "students_count"');
        expect(compiledQuery.sql).toContain('null as "incident_count"');
        // Should not execute count(distinct ea.student_id) on exam_attempts
        expect(compiledQuery.sql).not.toContain('count(distinct ea.student_id)');
    });

    it('includes computed students_count and incident_count subqueries when studentUserId is undefined', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // Non-student queries (instructor/admin) should compute telemetry
        expect(compiledQuery.sql).toContain('from "exam_attempts" as "ea"');
        expect(compiledQuery.sql).toContain('from "flagged_incidents" as "fi"');
    });

    it('includes count(*) over() window function and deterministic secondary order tie-breaker', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('count(*) over()::int as "total_count"');
        expect(compiledQuery.sql).toContain('order by "e"."updated_at" desc, "e"."exam_id" desc');
    });

    it('sanitizes search filter by escaping %, _, and \\ wildcards', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {
                search: '100% test_exam foo\\bar',
            },
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.parameters).toContain('%100\\% test\\_exam foo\\\\bar%');
    });

    it('clamps limit between 1 and 100 and clamps page to minimum 1', async () => {
        const { db, executeSpy } = createMockDb();

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {
                limit: 500,
                page: -2,
            },
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // Limit clamped to 100, page -2 clamped to 1 => offset 0
        expect(compiledQuery.parameters).toContain(100);
        expect(compiledQuery.parameters).toContain(0);
    });

    it('guards against empty visibility predicates by filtering false', async () => {
        const { db, executeSpy } = createMockDb();
        const spy = vi
            .spyOn(examAccessService, 'buildStaffExamVisibilityPredicates')
            .mockResolvedValueOnce([]);

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            instructorUserId: 'empty-instructor-1',
            filters: {},
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        // With mocked buildStaffExamVisibilityPredicates returning empty array,
        // query should safely append `false` condition rather than invalid empty syntax
        expect(compiledQuery.sql).toContain('and false');
        expect(compiledQuery.sql).not.toContain('and ()');
        expect(spy).toHaveBeenCalled();
    });
});
