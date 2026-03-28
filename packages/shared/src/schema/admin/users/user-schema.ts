import * as z from 'zod';

export const userFormBaseSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum([
        'admin',
        'proctor',
        'instructor',
        'student',
        'superadmin',
        'disciplinary_officer',
    ]),
    department: z.string().min(1, 'Department is required'),
    course: z.string().optional(),
    studentNo: z.string().optional(),
    institution: z.string().optional().nullable(),
});

export const userFormSchema = userFormBaseSchema.refine(
    (data) => {
        if (data.role === 'student') {
            if (!data.studentNo) return false;
            if (data.studentNo.length < 10 || data.studentNo.length > 12) return false;
        }
        return true;
    },
    {
        message: 'Student ID must be between 10 and 12 characters',
        path: ['studentNo'],
    },
).refine(
    (data) => {
        if (data.role === 'student' && !data.course) {
            return false;
        }
        return true;
    },
    {
        message: 'Course is required for students',
        path: ['course'],
    }
);

export type UserFormValues = z.infer<typeof userFormSchema>;
