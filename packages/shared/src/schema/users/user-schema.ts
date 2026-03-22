import * as z from 'zod';

export const userFormSchema = z
    .object({
        firstName: z
            .string()
            .min(2, 'First name must be at least 2 characters')
            .max(20, 'First name must not exceed 20 characters'),
        lastName: z
            .string()
            .min(2, 'Last name must be at least 2 characters')
            .max(20, 'Last name must not exceed 20 characters'),
        email: z
            .string()
            .email('Invalid email address')
            .max(100, 'Email must not exceed 100 characters'),
        role: z.enum(['superadmin', 'admin', 'proctor', 'instructor', 'student']),
        department: z.string().min(2, 'Department must be at least 2 characters'),
        studentNo: z
            .string()
            .min(2, 'Student Number must be at least 2 characters')
            .max(15, 'Student Number must not exceed 15 characters'),
    })
    .refine(
        (data) => {
            if (data.role === 'student' && !data.studentNo) {
                return false;
            }
            return true;
        },
        {
            message: 'Student ID is required for students',
            path: ['studentNo'],
        },
    );

export type UserFormValues = z.infer<typeof userFormSchema>;
