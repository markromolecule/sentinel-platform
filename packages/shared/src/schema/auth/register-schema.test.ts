import { describe, expect, it } from 'vitest';
import { RegisterSchema } from './register-schema';

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
});
