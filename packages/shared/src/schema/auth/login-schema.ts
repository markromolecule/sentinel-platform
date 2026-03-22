import * as z from 'zod';

export const LoginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .max(30, 'Password must not exceed 30 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    remember: z.boolean().optional(),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
