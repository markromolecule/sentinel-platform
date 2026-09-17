import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enrollStudentsData } from './enroll-students';
import { getAccessibleClassroomOrThrow } from '../../../core/classroom/services/classroom-access-query.service';

vi.mock('../../../core/classroom/services/classroom-access-query.service', () => ({
    getAccessibleClassroomOrThrow: vi.fn(),
}));

interface MockDbOptions {
    classGroup?: {
        class_group_id: string;
        subject_id: string;
        section_department_id: string | null;
        section_course_id: string | null;
    } | null;
    whitelistRecords?: Array<{
        student_number: string;
        claimed_user_id: string | null;
        department_id: string | null;
        course_id: string | null;
        institution_id: string;
    }>;
    existingEnrollmentStudentIds?: string[];
    transactionFailure?: Error;
}

function createDbClientMock(options: MockDbOptions = {}) {
    let queryCount = 0;
    const executedQueries: string[] = [];

    const defaultClassGroup = {
        class_group_id: '11111111-1111-4111-8111-111111111111',
        subject_id: 'subject-1',
        section_department_id: 'department-1',
        section_course_id: 'course-1',
    };

    const classGroup = options.classGroup !== undefined ? options.classGroup : defaultClassGroup;

    const classGroupQuery: any = {
        leftJoin: vi.fn(() => classGroupQuery),
        select: vi.fn(() => classGroupQuery),
        where: vi.fn(() => classGroupQuery),
        executeTakeFirst: vi.fn(async () => {
            queryCount++;
            executedQueries.push('selectFrom:class_groups');
            return classGroup;
        }),
    };

    const whitelistRecords = options.whitelistRecords ?? [
        {
            student_number: '20260001',
            claimed_user_id: 'student-user-1',
            department_id: 'department-1',
            course_id: 'course-1',
            institution_id: 'institution-1',
        },
        {
            student_number: '20260002',
            claimed_user_id: null,
            department_id: 'department-1',
            course_id: 'course-1',
            institution_id: 'institution-1',
        },
    ];

    const whitelistQuery: any = {
        selectAll: vi.fn(() => whitelistQuery),
        where: vi.fn(() => whitelistQuery),
        execute: vi.fn(async () => {
            queryCount++;
            executedQueries.push('selectFrom:student_whitelist');
            return whitelistRecords;
        }),
    };

    let capturedStudentInsertValues: any[] = [];
    let capturedOnConflictUpdateSet: any = null;

    const studentInsertQuery: any = {
        values: vi.fn((values: any[]) => {
            capturedStudentInsertValues = values;
            return studentInsertQuery;
        }),
        onConflict: vi.fn((conflictCallback: (oc: any) => any) => {
            const ocMock = {
                columns: vi.fn(() => ({
                    doUpdateSet: vi.fn((updateSet) => {
                        capturedOnConflictUpdateSet = updateSet;
                        return studentInsertQuery;
                    }),
                })),
            };
            conflictCallback(ocMock);
            return studentInsertQuery;
        }),
        returning: vi.fn(() => studentInsertQuery),
        execute: vi.fn(async () => {
            queryCount++;
            executedQueries.push('insertInto:students');
            if (options.transactionFailure) {
                throw options.transactionFailure;
            }
            return capturedStudentInsertValues.map((val) => ({
                student_id: `student-id-${val.student_number}`,
                student_number: val.student_number,
                user_id: val.user_id,
            }));
        }),
    };

    const existingEnrollmentStudentIds = new Set(options.existingEnrollmentStudentIds ?? []);

    const enrollmentSelectQuery: any = {
        select: vi.fn(() => enrollmentSelectQuery),
        where: vi.fn(() => enrollmentSelectQuery),
        execute: vi.fn(async () => {
            queryCount++;
            executedQueries.push('selectFrom:enrollments');
            return Array.from(existingEnrollmentStudentIds).map((student_id) => ({
                student_id,
            }));
        }),
    };

    let capturedEnrollmentInsertValues: any[] = [];

    const enrollmentInsertQuery: any = {
        values: vi.fn((values: any[]) => {
            capturedEnrollmentInsertValues = values;
            return enrollmentInsertQuery;
        }),
        onConflict: vi.fn((conflictCallback: (oc: any) => any) => {
            const ocMock = {
                columns: vi.fn(() => ({
                    doNothing: vi.fn(() => enrollmentInsertQuery),
                })),
            };
            conflictCallback(ocMock);
            return enrollmentInsertQuery;
        }),
        execute: vi.fn(async () => {
            queryCount++;
            executedQueries.push('insertInto:enrollments');
            return undefined;
        }),
    };

    const client = {
        selectFrom: vi.fn((table: string) => {
            if (table === 'class_groups as cg') return classGroupQuery;
            if (table === 'student_whitelist') return whitelistQuery;
            if (table === 'enrollments') return enrollmentSelectQuery;
            throw new Error(`Unexpected selectFrom table: ${table}`);
        }),
        insertInto: vi.fn((table: string) => {
            if (table === 'students') return studentInsertQuery;
            if (table === 'enrollments') return enrollmentInsertQuery;
            throw new Error(`Unexpected insertInto table: ${table}`);
        }),
        getQueryCount: () => queryCount,
        getExecutedQueries: () => executedQueries,
        getCapturedStudentInsertValues: () => capturedStudentInsertValues,
        getCapturedEnrollmentInsertValues: () => capturedEnrollmentInsertValues,
        getCapturedOnConflictUpdateSet: () => capturedOnConflictUpdateSet,
    } as any;

    return client;
}

describe('enrollStudentsData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getAccessibleClassroomOrThrow).mockResolvedValue({
            class_group_id: '11111111-1111-4111-8111-111111111111',
        } as any);
    });

    describe('Task 2.1 & 2.2: 45-Student Cohort Batch Enrollment & Query Counter', () => {
        it('enrolls a 45-student cohort in <= 6 total queries with a single batch write', async () => {
            const studentNumbers = Array.from(
                { length: 45 },
                (_, i) => `2026${String(i + 1).padStart(4, '0')}`,
            );

            const whitelistRecords = studentNumbers.map((num, i) => ({
                student_number: num,
                claimed_user_id: i % 2 === 0 ? `user-${num}` : null,
                department_id: 'department-1',
                course_id: 'course-1',
                institution_id: 'institution-1',
            }));

            const dbClient = createDbClientMock({ whitelistRecords });

            const result = await enrollStudentsData({
                dbClient,
                institutionId: 'institution-1',
                userId: 'admin-1',
                userRole: 'admin',
                payload: {
                    studentNumbers,
                    classGroupId: '11111111-1111-4111-8111-111111111111',
                },
            });

            // 1. Check result contract
            expect(result.enrolledCount).toBe(45);
            expect(result.failedCount).toBe(0);
            expect(result.results).toHaveLength(45);
            expect(result.results.every((r) => r.status === 'SUCCESS')).toBe(true);

            // 2. Query count budget: MUST be <= 6 queries (strictly 5 queries in this scenario: class_group, whitelist, students insert, enrollments select, enrollments insert)
            const queryCount = dbClient.getQueryCount();
            expect(queryCount).toBeLessThanOrEqual(6);
            expect(queryCount).toBe(5);
            expect(dbClient.getExecutedQueries()).toEqual([
                'selectFrom:class_groups',
                'selectFrom:student_whitelist',
                'insertInto:students',
                'selectFrom:enrollments',
                'insertInto:enrollments',
            ]);

            // 3. Verify single multi-row student insert
            const studentInserts = dbClient.getCapturedStudentInsertValues();
            expect(studentInserts).toHaveLength(45);
            expect(studentInserts[0].student_number).toBe('20260001');
            expect(studentInserts[44].student_number).toBe('20260045');

            // 4. Verify single multi-row enrollment insert
            const enrollmentInserts = dbClient.getCapturedEnrollmentInsertValues();
            expect(enrollmentInserts).toHaveLength(45);
            expect(enrollmentInserts[0].class_group_id).toBe(
                '11111111-1111-4111-8111-111111111111',
            );
            expect(enrollmentInserts[0].student_id).toBe('student-id-20260001');
        });
    });

    describe('Task 2.3: Claimed vs Unclaimed Account Integrity', () => {
        it('correctly maps claimed user_id and null user_id during batch student upsert', async () => {
            const whitelistRecords = [
                {
                    student_number: '20260001',
                    claimed_user_id: 'claimed-user-uuid-1',
                    department_id: 'department-1',
                    course_id: 'course-1',
                    institution_id: 'institution-1',
                },
                {
                    student_number: '20260002',
                    claimed_user_id: null,
                    department_id: 'department-1',
                    course_id: 'course-1',
                    institution_id: 'institution-1',
                },
            ];

            const dbClient = createDbClientMock({ whitelistRecords });

            const result = await enrollStudentsData({
                dbClient,
                institutionId: 'institution-1',
                userId: 'admin-1',
                payload: {
                    studentNumbers: ['20260001', '20260002'],
                    classGroupId: '11111111-1111-4111-8111-111111111111',
                },
            });

            expect(result.enrolledCount).toBe(2);

            const studentInserts = dbClient.getCapturedStudentInsertValues();
            expect(studentInserts).toHaveLength(2);
            // Claimed student keeps user_id
            expect(studentInserts[0].user_id).toBe('claimed-user-uuid-1');
            // Unclaimed student has user_id null
            expect(studentInserts[1].user_id).toBeNull();
        });

        it('preserves claimed user_id on conflict using COALESCE in doUpdateSet', async () => {
            const dbClient = createDbClientMock();

            await enrollStudentsData({
                dbClient,
                institutionId: 'institution-1',
                userId: 'admin-1',
                payload: {
                    studentNumbers: ['20260001'],
                    classGroupId: '11111111-1111-4111-8111-111111111111',
                },
            });

            const updateSet = dbClient.getCapturedOnConflictUpdateSet();
            expect(updateSet).toBeDefined();
            // Verify COALESCE expression is present on user_id conflict resolution
            const rawNode = updateSet.user_id.toOperationNode();
            expect(rawNode.kind).toBe('RawNode');
            expect(rawNode.sqlFragments).toContain('coalesce(excluded.user_id, students.user_id)');
        });
    });

    describe('Task 2.4: Duplicate & Already Enrolled Handling', () => {
        it('marks already-enrolled students as FAILED with explicit reason and enrolls new students', async () => {
            const whitelistRecords = [
                {
                    student_number: '20260001',
                    claimed_user_id: 'user-1',
                    department_id: 'department-1',
                    course_id: 'course-1',
                    institution_id: 'institution-1',
                },
                {
                    student_number: '20260002',
                    claimed_user_id: 'user-2',
                    department_id: 'department-1',
                    course_id: 'course-1',
                    institution_id: 'institution-1',
                },
                {
                    student_number: '20260003',
                    claimed_user_id: 'user-3',
                    department_id: 'department-1',
                    course_id: 'course-1',
                    institution_id: 'institution-1',
                },
            ];

            // Student 2 is already enrolled in the classroom
            const dbClient = createDbClientMock({
                whitelistRecords,
                existingEnrollmentStudentIds: ['student-id-20260002'],
            });

            const result = await enrollStudentsData({
                dbClient,
                institutionId: 'institution-1',
                userId: 'admin-1',
                payload: {
                    studentNumbers: ['20260001', '20260002', '20260003'],
                    classGroupId: '11111111-1111-4111-8111-111111111111',
                },
            });

            expect(result.enrolledCount).toBe(2);
            expect(result.failedCount).toBe(1);
            expect(result.results).toEqual([
                { studentNumber: '20260001', status: 'SUCCESS' },
                {
                    studentNumber: '20260002',
                    status: 'FAILED',
                    reason: 'Student is already enrolled in the selected classroom.',
                },
                { studentNumber: '20260003', status: 'SUCCESS' },
            ]);

            // Only students 1 and 3 should be inserted into enrollments
            const enrollmentInserts = dbClient.getCapturedEnrollmentInsertValues();
            expect(enrollmentInserts).toHaveLength(2);
            expect(enrollmentInserts.map((e: any) => e.student_id)).toEqual([
                'student-id-20260001',
                'student-id-20260003',
            ]);
        });
    });

    describe('Task 2.5: Out-of-Scope / Invalid Student Numbers', () => {
        it('rejects non-whitelisted, department mismatch, and course mismatch with specific reasons in mixed batch', async () => {
            const whitelistRecords = [
                {
                    student_number: '20260001',
                    claimed_user_id: 'user-1',
                    department_id: 'department-1',
                    course_id: 'course-1',
                    institution_id: 'institution-1',
                },
                {
                    student_number: '20260002',
                    claimed_user_id: 'user-2',
                    department_id: 'department-OTHER',
                    course_id: 'course-1',
                    institution_id: 'institution-1',
                },
                {
                    student_number: '20260003',
                    claimed_user_id: 'user-3',
                    department_id: 'department-1',
                    course_id: 'course-OTHER',
                    institution_id: 'institution-1',
                },
            ];

            const dbClient = createDbClientMock({ whitelistRecords });

            const result = await enrollStudentsData({
                dbClient,
                institutionId: 'institution-1',
                userId: 'admin-1',
                payload: {
                    studentNumbers: [
                        '20260001', // Valid
                        '20260002', // Dept mismatch
                        '20260003', // Course mismatch
                        '20260099', // Not on whitelist
                    ],
                    classGroupId: '11111111-1111-4111-8111-111111111111',
                },
            });

            expect(result.enrolledCount).toBe(1);
            expect(result.failedCount).toBe(3);
            expect(result.results).toEqual([
                { studentNumber: '20260001', status: 'SUCCESS' },
                {
                    studentNumber: '20260002',
                    status: 'FAILED',
                    reason: 'Department mismatch.',
                },
                {
                    studentNumber: '20260003',
                    status: 'FAILED',
                    reason: 'Course mismatch.',
                },
                {
                    studentNumber: '20260099',
                    status: 'FAILED',
                    reason: 'Student not found in whitelist.',
                },
            ]);

            // Only the valid student was upserted and enrolled
            const studentInserts = dbClient.getCapturedStudentInsertValues();
            expect(studentInserts).toHaveLength(1);
            expect(studentInserts[0].student_number).toBe('20260001');
        });

        it('returns early with 0 database write queries if all students fail in-memory validation', async () => {
            const dbClient = createDbClientMock({ whitelistRecords: [] });

            const result = await enrollStudentsData({
                dbClient,
                institutionId: 'institution-1',
                userId: 'admin-1',
                payload: {
                    studentNumbers: ['20260098', '20260099'],
                    classGroupId: '11111111-1111-4111-8111-111111111111',
                },
            });

            expect(result.enrolledCount).toBe(0);
            expect(result.failedCount).toBe(2);
            expect(result.results.every((r) => r.status === 'FAILED')).toBe(true);

            // Only 2 read queries executed (class group check + whitelist query)
            expect(dbClient.getQueryCount()).toBe(2);
            expect(dbClient.getExecutedQueries()).toEqual([
                'selectFrom:class_groups',
                'selectFrom:student_whitelist',
            ]);
            expect(dbClient.getCapturedStudentInsertValues()).toHaveLength(0);
            expect(dbClient.getCapturedEnrollmentInsertValues()).toHaveLength(0);
        });

        it('returns zero results immediately if studentNumbers array is empty', async () => {
            const dbClient = createDbClientMock();

            const result = await enrollStudentsData({
                dbClient,
                institutionId: 'institution-1',
                userId: 'admin-1',
                payload: {
                    studentNumbers: [],
                    classGroupId: '11111111-1111-4111-8111-111111111111',
                },
            });

            expect(result).toEqual({
                enrolledCount: 0,
                failedCount: 0,
                results: [],
            });
            // 0 queries executed after access check
            expect(dbClient.getQueryCount()).toBe(0);
        });
    });

    describe('Edge Cases & Failure Resilience', () => {
        it('throws an error if class group is not found', async () => {
            const dbClient = createDbClientMock({ classGroup: null });

            await expect(
                enrollStudentsData({
                    dbClient,
                    institutionId: 'institution-1',
                    userId: 'admin-1',
                    payload: {
                        studentNumbers: ['20260001'],
                        classGroupId: '11111111-1111-4111-8111-111111111111',
                    },
                }),
            ).rejects.toThrow('Class group not found.');
        });

        it('gracefully handles database transaction errors by failing valid students with error message', async () => {
            const dbClient = createDbClientMock({
                transactionFailure: new Error('Unique constraint violation or timeout'),
            });

            const result = await enrollStudentsData({
                dbClient,
                institutionId: 'institution-1',
                userId: 'admin-1',
                payload: {
                    studentNumbers: ['20260001'],
                    classGroupId: '11111111-1111-4111-8111-111111111111',
                },
            });

            expect(result.enrolledCount).toBe(0);
            expect(result.failedCount).toBe(1);
            expect(result.results[0]).toEqual({
                studentNumber: '20260001',
                status: 'FAILED',
                reason: 'Unique constraint violation or timeout',
            });
        });
    });
});
