import { type DbClient } from '@sentinel/db';
import { getCoursesData, type GetCoursesDataResponse } from './data/get-courses';
import {
    getDefaultInstitutionData,
    type GetDefaultInstitutionDataResponse,
} from './data/get-default-institution';
import {
    getDepartmentsData,
    type GetDepartmentsDataResponse,
} from './data/get-departments';
import {
    getInstitutionsData,
    type GetInstitutionsDataResponse,
} from './data/get-institutions';
import { createStudentProfile } from './services/create-student-profile';
import type { StudentOnboardingInput } from './services/student-onboarding.types';

export class OnboardingService {
    static async createStudent(
        dbClient: DbClient,
        userId: string,
        studentData: StudentOnboardingInput,
    ) {
        return await createStudentProfile(dbClient, userId, studentData);
    }

    static async getInstitutions(dbClient: DbClient): Promise<GetInstitutionsDataResponse> {
        return await getInstitutionsData({ dbClient });
    }

    static async getDepartments(
        dbClient: DbClient,
        institutionId?: string,
    ): Promise<GetDepartmentsDataResponse> {
        return await getDepartmentsData({ dbClient, institutionId });
    }

    static async getCourses(
        dbClient: DbClient,
        departmentId?: string,
        institutionId?: string,
    ): Promise<GetCoursesDataResponse> {
        return await getCoursesData({ dbClient, departmentId, institutionId });
    }

    static async getDefaultInstitution(
        dbClient: DbClient,
    ): Promise<GetDefaultInstitutionDataResponse> {
        return await getDefaultInstitutionData({ dbClient });
    }
}
