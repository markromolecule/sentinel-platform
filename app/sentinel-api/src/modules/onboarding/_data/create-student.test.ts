import { describe, expect, it } from 'vitest';
import { testWithDbClient } from '@/lib/test-with-db-client';
import { createStudentData } from './create-student';
import { makeFakeStudent } from '../__test-utils__/make-fake-student';

// Note: To make this work properly in a real DB setting,
// you would need an existing User, Department, and Institution ID.
// For the purpose of this demonstration of Kysely integration,
// we will assume a user ID is known or we will expect a FK error if it's missing,
// OR we can create a temporary user in the transaction.

describe('createStudentData', () => {
    testWithDbClient('should create a new student record', async ({ dbClient }) => {
        // 1. Create a prerequisite user first to satisfy the FK constraint
        const mockUser = await dbClient
            .insertInto('auth.users')
            .values({
                id: crypto.randomUUID(),
                email: `test-${Date.now()}@example.com`,
                is_sso_user: false,
                is_anonymous: false,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        // 2. Create a fake student pointing to the mock user
        const mockStudent = makeFakeStudent({
            user_id: mockUser.id,
            institution_id: null,
            department_id: null,
        });

        // 3. Execute the function under test
        const createdStudent = await createStudentData({ dbClient, values: mockStudent });

        // 4. Assertions
        expect(createdStudent).toBeDefined();
        expect(createdStudent.student_id).toBeDefined();
        expect(createdStudent.user_id).toBe(mockUser.id);
        expect(createdStudent.student_number).toBe(mockStudent.student_number);

        // 5. Verify it's actually in the database
        const studentInDb = await dbClient
            .selectFrom('students')
            .selectAll()
            .where('student_id', '=', createdStudent.student_id)
            .executeTakeFirst();

        expect(studentInDb).toBeDefined();
        expect(studentInDb?.student_number).toBe(mockStudent.student_number);
    });
});
