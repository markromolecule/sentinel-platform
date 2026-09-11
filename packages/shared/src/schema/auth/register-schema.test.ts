import { describe, expect, it } from 'vitest';
import { RegisterSchema, ApiRegisterSchema } from './register-schema';

describe('RegisterSchema Email Validation', () => {
    const baseValidData = {
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        terms: true,
    };

    it('should validate a valid @gmail.com address', () => {
        const result = RegisterSchema.safeParse({
            ...baseValidData,
            email: 'student.sample@gmail.com',
        });
        expect(result.success).toBe(true);
    });

    it('should validate an institutional .edu.ph address', () => {
        const result = RegisterSchema.safeParse({
            ...baseValidData,
            email: 'student@tup.edu.ph',
        });
        expect(result.success).toBe(true);
    });

    it('should validate an institutional .edu address', () => {
        const result = RegisterSchema.safeParse({
            ...baseValidData,
            email: 'student@university.edu',
        });
        expect(result.success).toBe(true);
    });

    it('should reject non-gmail and non-edu addresses', () => {
        const result = RegisterSchema.safeParse({
            ...baseValidData,
            email: 'fake.student@yahoo.com',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('Registration requires a valid Gmail address');
        }
    });

    it('should reject invalid or fake domains', () => {
        const result = RegisterSchema.safeParse({
            ...baseValidData,
            email: 'badactor@tempmail.xyz',
        });
        expect(result.success).toBe(false);
    });

    it('should accept an optional captchaToken on valid registration', () => {
        const result = RegisterSchema.safeParse({
            ...baseValidData,
            email: 'student.sample@gmail.com',
            captchaToken: 'dummy-turnstile-token-xyz',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.captchaToken).toBe('dummy-turnstile-token-xyz');
        }
    });

    it('should accept null or omitted captchaToken in RegisterSchema and ApiRegisterSchema', () => {
        const withNull = RegisterSchema.safeParse({
            ...baseValidData,
            email: 'student.null@gmail.com',
            captchaToken: null,
        });
        expect(withNull.success).toBe(true);

        const withUndefined = ApiRegisterSchema.safeParse({
            firstName: 'Julian',
            lastName: 'Adriano',
            email: 'student.omitted@gmail.com',
            password: baseValidData.password,
            captchaToken: undefined,
        });
        expect(withUndefined.success).toBe(true);
    });
});

