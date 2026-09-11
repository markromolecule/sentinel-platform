import { describe, expect, it } from 'vitest';
import { VerifyOtpSchema } from './verify-otp-schema';

describe('VerifyOtpSchema', () => {
    it('should validate correct 6-digit code and email', () => {
        const result = VerifyOtpSchema.safeParse({
            email: 'student@gmail.com',
            token: '123456',
            type: 'signup',
        });
        expect(result.success).toBe(true);
    });

    it('should reject codes with less than 6 digits', () => {
        const result = VerifyOtpSchema.safeParse({
            email: 'student@gmail.com',
            token: '12345',
        });
        expect(result.success).toBe(false);
    });

    it('should reject codes with non-numeric characters', () => {
        const result = VerifyOtpSchema.safeParse({
            email: 'student@gmail.com',
            token: '12A456',
        });
        expect(result.success).toBe(false);
    });

    it('should reject invalid email in OTP verification', () => {
        const result = VerifyOtpSchema.safeParse({
            email: 'not-an-email',
            token: '123456',
        });
        expect(result.success).toBe(false);
    });
});
