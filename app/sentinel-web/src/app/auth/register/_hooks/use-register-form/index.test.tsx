/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRegisterForm } from './index';

const {
    mockUseSignUpMutation,
    mockUseVerifyOtpMutation,
    mockRouterPush,
    mockRouterRefresh,
} = vi.hoisted(() => ({
    mockUseSignUpMutation: vi.fn(),
    mockUseVerifyOtpMutation: vi.fn(),
    mockRouterPush: vi.fn(),
    mockRouterRefresh: vi.fn(),
}));

let signUpOptions: any = null;

vi.mock('@sentinel/hooks', () => ({
    useSignUpMutation: (options: any) => {
        signUpOptions = options;
        return {
            mutate: mockUseSignUpMutation,
            isPending: false,
        };
    },
    useVerifyOtpMutation: () => ({
        mutate: mockUseVerifyOtpMutation,
        isPending: false,
    }),
    SignUpError: class SignUpError extends Error {
        code: string;
        constructor(message: string, code: string) {
            super(message);
            this.code = code;
        }
    },
    VerifyOtpError: class VerifyOtpError extends Error {
        code: string;
        constructor(message: string, code: string) {
            super(message);
            this.code = code;
        }
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush,
        refresh: mockRouterRefresh,
    }),
}));

describe('useRegisterForm Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        signUpOptions = null;
    });

    it('redirects to /auth/confirm-code with encoded email on successful registration', async () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.form.setValue('email', 'student@example.com');
        });

        // Trigger signUp onSuccess callback
        act(() => {
            signUpOptions.onSuccess({ user: { email: 'student@example.com' } });
        });

        expect(mockRouterPush).toHaveBeenCalledWith(
            '/auth/confirm-code?email=student%40example.com',
        );
    });

    it('forwards captchaToken when submitting form with captcha completed', async () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.onCaptchaSuccess('turnstile-valid-token-123');
            result.current.form.reset({
                firstName: 'Juan',
                lastName: 'Dela Cruz',
                email: 'juan@gmail.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                terms: true,
                captchaToken: 'turnstile-valid-token-123',
            });
        });

        await act(async () => {
            await result.current.onSubmit();
        });

        expect(mockUseSignUpMutation).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'juan@gmail.com',
                password: 'Password123!',
                captchaToken: 'turnstile-valid-token-123',
                options: expect.objectContaining({
                    captchaToken: 'turnstile-valid-token-123',
                    data: expect.objectContaining({
                        first_name: 'Juan',
                        last_name: 'Dela Cruz',
                        role: 'student',
                    }),
                }),
            }),
        );
    });

    it('clears captchaToken on signup error and sets error message', () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.onCaptchaSuccess('turnstile-token-xyz');
        });

        expect(result.current.captchaToken).toBe('turnstile-token-xyz');

        act(() => {
            signUpOptions.onError(new Error('Turnstile verification failed'));
        });

        expect(result.current.captchaToken).toBeNull();
        expect(result.current.form.getValues('captchaToken')).toBeUndefined();
        expect(result.current.authError).toBe('Turnstile verification failed');
    });

    it('clears captchaToken and sets security error message on onCaptchaError', () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            result.current.onCaptchaSuccess('turnstile-token-xyz');
        });

        expect(result.current.captchaToken).toBe('turnstile-token-xyz');
        expect(result.current.form.getValues('captchaToken')).toBe('turnstile-token-xyz');

        act(() => {
            result.current.onCaptchaError();
        });

        expect(result.current.captchaToken).toBeNull();
        expect(result.current.form.getValues('captchaToken')).toBeUndefined();
        expect(result.current.authError).toContain('Security verification failed');
    });

    it('blocks submission and displays error when site key exists but captcha is not solved', async () => {
        const originalSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
        process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY = 'test-site-key-123';

        try {
            const { result } = renderHook(() => useRegisterForm());

            act(() => {
                result.current.form.reset({
                    firstName: 'Juan',
                    lastName: 'Dela Cruz',
                    email: 'juan@gmail.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!',
                    terms: true,
                });
            });

            await act(async () => {
                await result.current.onSubmit();
            });

            expect(mockUseSignUpMutation).not.toHaveBeenCalled();
            expect(result.current.authError).toBe(
                'Please complete the security check before creating an account.',
            );
        } finally {
            process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY = originalSiteKey;
        }
    });

    it('clears stale captcha authError when onCaptchaSuccess receives a new token', () => {
        const { result } = renderHook(() => useRegisterForm());

        act(() => {
            signUpOptions.onError(
                new Error('captcha protection: request disallowed (no captcha_token found)'),
            );
        });

        expect(result.current.authError).toContain('captcha');

        act(() => {
            result.current.onCaptchaSuccess('fresh-valid-token-789');
        });

        expect(result.current.authError).toBeNull();
        expect(result.current.captchaToken).toBe('fresh-valid-token-789');
        expect(result.current.form.getValues('captchaToken')).toBe('fresh-valid-token-789');
    });
});

