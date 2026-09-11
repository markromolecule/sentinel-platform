import * as z from 'zod';

export const VerifyOtpSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .trim()
        .toLowerCase()
        .email('Invalid email address'),
    token: z
        .string()
        .min(1, 'Verification code is required')
        .length(6, 'Verification code must be exactly 6 digits')
        .regex(/^[0-9]+$/, 'Verification code must contain only numbers'),
    type: z.enum(['signup', 'email_change', 'recovery', 'invite']).default('signup'),
});

export type VerifyOtpSchemaType = z.infer<typeof VerifyOtpSchema>;
