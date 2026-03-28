import * as z from 'zod';

export const UpdatePasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(30, 'Password must not exceed 30 characters')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
        confirmPassword: z
            .string()
            .min(8, 'Confirm Password must be at least 8 characters')
            .max(30, 'Confirm Password must not exceed 30 characters')
            .regex(/[a-z]/, 'Confirm Password must contain at least one lowercase letter')
            .regex(/[A-Z]/, 'Confirm Password must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Confirm Password must contain at least one number')
            .regex(/[^a-zA-Z0-9]/, 'Confirm Password must contain at least one special character'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type UpdatePasswordSchemaType = z.infer<typeof UpdatePasswordSchema>;
