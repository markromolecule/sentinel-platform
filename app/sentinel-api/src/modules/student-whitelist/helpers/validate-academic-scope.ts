import { type DbClient } from '@sentinel/db';
import { getAcademicScopeData } from '../data/get-academic-scope';

export async function validateAcademicScope(
    dbClient: DbClient,
    {
        institutionId,
        departmentId,
        courseId,
    }: {
        institutionId: string;
        departmentId: string;
        courseId: string;
    },
) {
    const academicScope = await getAcademicScopeData({
        dbClient,
        departmentId,
        courseId,
    });

    if (!academicScope) {
        throw new Error('Department not found');
    }

    if (academicScope.department_institution_id !== institutionId) {
        throw new Error('Department does not belong to the selected institution');
    }

    if (!academicScope.course_exists) {
        throw new Error('Course not found');
    }

    if (!academicScope.course_id) {
        throw new Error('Course does not belong to the selected department');
    }

    if (academicScope.course_institution_id !== institutionId) {
        throw new Error('Course does not belong to the selected institution');
    }
}
