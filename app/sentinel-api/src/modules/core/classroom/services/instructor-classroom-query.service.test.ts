import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getInstructorClassrooms } from './instructor-classroom-query.service';
import { getClassGroupColumnSupport } from '../helper/classroom-schema-compat';
import { buildAccessibleClassroomsQuery } from './classroom-access-query.service';
import { buildClassroomResponse } from '../helper/classroom-mappers';

vi.mock('../helper/classroom-schema-compat', () => ({
    getClassGroupColumnSupport: vi.fn(),
}));

vi.mock('./classroom-access-query.service', () => ({
    buildAccessibleClassroomsQuery: vi.fn(),
    getAccessibleClassroomOrThrow: vi.fn(),
}));

vi.mock('../helper/classroom-mappers', () => ({
    buildClassroomResponse: vi.fn((classroom) => classroom),
}));

function createQueryBuilder() {
    const queryBuilder: any = {
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([
            {
                class_group_id: 'class-1',
                class_name: 'Physics 101',
                subject_code: 'PHY101',
                subject_title: 'Physics',
                section_name: 'BSCS 3A',
                term_academic_year: '2025-2026',
                term_semester: '1st Semester',
                department_id: 'department-1',
                department_code: 'CIT',
                department_name: 'College of IT',
                course_id: 'course-1',
                course_code: 'BSCS',
                course_title: 'BS Computer Science',
                year_level: 3,
                institution_id: 'institution-1',
                created_at: '2026-05-01T00:00:00.000Z',
                updated_at: '2026-05-01T00:00:00.000Z',
                updated_by: 'user-1',
                updated_by_name: 'Admin',
                instructors: [],
            },
        ]),
    };

    queryBuilder.$if = vi.fn().mockImplementation((condition, callback) => {
        if (condition && typeof callback === 'function') {
            callback(queryBuilder);
        }

        return queryBuilder;
    });

    return {
        ...queryBuilder,
    } as any;
}

describe('getInstructorClassrooms', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getClassGroupColumnSupport).mockResolvedValue({
            hasClassName: true,
            hasUpdatedAt: true,
        } as any);
    });

    it('adds the department filter when a department is provided', async () => {
        const queryBuilder = createQueryBuilder();
        vi.mocked(buildAccessibleClassroomsQuery).mockResolvedValue(queryBuilder);

        const result = await getInstructorClassrooms({} as any, {
            userId: 'user-1',
            institutionId: 'institution-1',
            search: 'physics',
            departmentId: 'department-1',
        });

        expect(result).toHaveLength(1);
        expect(queryBuilder.where).toHaveBeenCalledWith('cg.class_name', 'is not', null);
        expect(queryBuilder.where).toHaveBeenCalledWith('sec.department_id', '=', 'department-1');
        expect(buildClassroomResponse).toHaveBeenCalled();
    });

    it('keeps the query institution scoped even without a department filter', async () => {
        const queryBuilder = createQueryBuilder();
        vi.mocked(buildAccessibleClassroomsQuery).mockResolvedValue(queryBuilder);

        await getInstructorClassrooms({} as any, {
            userId: 'user-1',
            institutionId: 'institution-1',
        });

        expect(buildAccessibleClassroomsQuery).toHaveBeenCalledWith(
            {},
            {
                userId: 'user-1',
                institutionId: 'institution-1',
            },
            'instructor',
            { status: undefined },
        );
        expect(queryBuilder.where).not.toHaveBeenCalledWith(
            'sec.department_id',
            '=',
            expect.any(String),
        );
    });

    it('uses the admin access path for admin users while still applying department scope', async () => {
        const queryBuilder = createQueryBuilder();
        vi.mocked(buildAccessibleClassroomsQuery).mockResolvedValue(queryBuilder);

        await getInstructorClassrooms({} as any, {
            userId: 'admin-1',
            userRole: 'admin',
            institutionId: 'institution-1',
            departmentId: 'department-1',
        });

        expect(buildAccessibleClassroomsQuery).toHaveBeenCalledWith(
            {},
            {
                userId: 'admin-1',
                institutionId: 'institution-1',
            },
            'admin',
            { status: undefined },
        );
        expect(queryBuilder.where).toHaveBeenCalledWith('sec.department_id', '=', 'department-1');
    });

    it('forwards the status filter option when provided', async () => {
        const queryBuilder = createQueryBuilder();
        vi.mocked(buildAccessibleClassroomsQuery).mockResolvedValue(queryBuilder);

        await getInstructorClassrooms({} as any, {
            userId: 'user-1',
            institutionId: 'institution-1',
            status: 'archived',
        });

        expect(buildAccessibleClassroomsQuery).toHaveBeenCalledWith(
            {},
            {
                userId: 'user-1',
                institutionId: 'institution-1',
            },
            'instructor',
            { status: 'archived' },
        );
    });
});
