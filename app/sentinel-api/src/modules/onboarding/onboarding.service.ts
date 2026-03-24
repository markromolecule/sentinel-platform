import { createStudentData } from './data/create-student';
import { getDepartmentsData, type GetDepartmentsDataResponse } from './data/get-departments';
import { getInstitutionsData, type GetInstitutionsDataResponse } from './data/get-institutions';
import { getCoursesData, type GetCoursesDataResponse } from './data/get-courses';
import { getDefaultInstitutionData, type GetDefaultInstitutionDataResponse } from './data/get-default-institution';
import { type DbClient } from '@sentinel/db';

export class OnboardingService {
    static async createStudent(
        dbClient: DbClient,
        userId: string,
        studentData: {
            firstName: string;
            lastName: string;
            studentNumber: string;
            institutionId: string;
            departmentId?: string;
            courseId?: string;
        },
    ) {
        if (!studentData.institutionId || studentData.institutionId === '') {
            throw new Error('Please select an institution to continue your onboarding.');
        }

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

            // Check if student number is already taken by another user
            const studentWithNumber = await dbClient
                .selectFrom('students')
                .where('student_number', '=', studentData.studentNumber)
                .selectAll()
                .executeTakeFirst();

            if (studentWithNumber) {
                throw new Error(
                    `Student number "${studentData.studentNumber}" is already registered to another account.`,
                );
            }

            // Update user profile first
            await dbClient
                .updateTable('user_profiles')
                .set({
                    first_name: studentData.firstName,
                    last_name: studentData.lastName,
                    institution_id: studentData.institutionId,
                    updated_at: new Date(),
                })
                .where('user_id', '=', userId)
                .execute();

            // Create student record
            const newStudent = await createStudentData({
                dbClient,
                values: {
                    user_id: userId,
                    student_number: studentData.studentNumber,
                    institution_id: studentData.institutionId,
                    department_id: studentData.departmentId,
                    course_id: studentData.courseId,
                },
            });

            return newStudent;
        } catch (error) {
            throw error;
        }
    }

    static async getInstitutions(dbClient: DbClient): Promise<GetInstitutionsDataResponse> {
        try {
            const institutions = await getInstitutionsData({ dbClient });
            return institutions;
        } catch (error) {
            throw error;
        }
    }

    static async getDepartments(dbClient: DbClient, institutionId?: string): Promise<GetDepartmentsDataResponse> {
        try {
            const departments = await getDepartmentsData({ dbClient, institutionId });
            return departments;
        } catch (error) {
            throw error;
        }
    }

    static async getCourses(dbClient: DbClient, departmentId?: string, institutionId?: string): Promise<GetCoursesDataResponse> {
        try {
            const courses = await getCoursesData({ dbClient, departmentId, institutionId });
            return courses;
        } catch (error) {
            throw error;
        }
    }

    static async getDefaultInstitution(dbClient: DbClient): Promise<GetDefaultInstitutionDataResponse> {
        try {
            const institution = await getDefaultInstitutionData({ dbClient });
            return institution;
        } catch (error) {
            throw error;
        }
    }
}
