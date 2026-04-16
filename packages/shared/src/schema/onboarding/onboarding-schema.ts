import * as z from 'zod';

export const onboardingSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First Name is required')
        .max(50, 'First Name must not exceed 50 characters'),
    lastName: z
        .string()
        .min(1, 'Last Name is required')
        .max(50, 'Last Name must not exceed 50 characters'),
    institutionId: z.string().min(1, 'Please select an institution'),
    departmentId: z.string().min(1, 'Please select a department'),
    courseId: z.string().min(1, 'Please select a course'),
    studentNumber: z
        .string()
        .min(1, 'Student Number is required')
        .max(12, 'Student Number must not exceed 12 characters'),
});

export type OnboardingSchemaValues = z.infer<typeof onboardingSchema>;
