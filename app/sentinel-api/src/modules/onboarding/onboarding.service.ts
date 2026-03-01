import { createStudentData } from './data/create-student';
import { getDefaultInstitutionData } from './data/get-default-institution';
import { getDepartmentsData } from './data/get-departments';
import { type DbClient } from '../../lib/create-db-client';

export class OnboardingService {
    static async createStudent(
        dbClient: DbClient,
        userId: string,
        studentData: { studentNumber: string; institutionId: string; departmentId?: string },
    ) {
        try {
            // Check if user exists
            const user = await dbClient
                .selectFrom('auth.users')
                .where('id', '=', userId)
                .selectAll()
                .executeTakeFirst();

            if (!user) {
                throw new Error('User not found');
            }

            // Check if student record already exists
            const existingStudent = await dbClient
                .selectFrom('students')
                .where('user_id', '=', userId)
                .selectAll()
                .executeTakeFirst();

            if (existingStudent) {
                throw new Error('Student profile already exists');
            }

            // Create student record
            const newStudent = await createStudentData({
                dbClient,
                values: {
                    user_id: userId,
                    student_number: studentData.studentNumber,
                    institution_id: studentData.institutionId,
                    department_id: studentData.departmentId,
                },
            });

            return newStudent;
        } catch (error) {
            throw error;
        }
    }

    static async getDepartments(dbClient: DbClient) {
        try {
            const departments = await getDepartmentsData({ dbClient });
            return departments;
        } catch (error) {
            throw error;
        }
    }

    static async getDefaultInstitution(dbClient: DbClient) {
        try {
            const institution = await getDefaultInstitutionData({ dbClient });
            return institution;
        } catch (error) {
            throw error;
        }
    }
}
