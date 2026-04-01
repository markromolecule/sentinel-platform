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
    courseIds: z.array(z.string()),
    studentNo: z.string().optional(),
    employeeNo: z.string().optional(),
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
        if (data.role === 'instructor' && !data.employeeNo) {
            return false;
        }
        return true;
    },
    {
        message: 'Employee ID is required for instructors',
        path: ['employeeNo'],
    },
).refine(
    (data) => {
        if ((data.role === 'student' || data.role === 'admin') && !data.course) {
            return false;
        }
        return true;
    },
    {
        message: 'Course is required',
        path: ['course'],
    },
).refine(
    (data) => {
        if (data.role !== 'instructor') {
            return true;
        }

        return (data.courseIds ?? []).length > 0;
    },
    {
        message: 'At least one course is required for instructors',
        path: ['courseIds'],
    },
);

export type UserFormValues = z.infer<typeof userFormSchema>;
