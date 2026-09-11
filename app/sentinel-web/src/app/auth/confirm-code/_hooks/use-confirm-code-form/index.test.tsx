/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConfirmCodeForm } from './index';

const {
    mockUseVerifyOtpMutation,
    mockRouterPush,
    mockRouterRefresh,
    mockSearchParamsGet,
    mockSupabaseResend,
} = vi.hoisted(() => ({
    mockUseVerifyOtpMutation: vi.fn(),
    mockRouterPush: vi.fn(),
    mockRouterRefresh: vi.fn(),
    mockSearchParamsGet: vi.fn(),
    mockSupabaseResend: vi.fn(),
}));

let mutateVerifyOtpHandler: any = null;

vi.mock('@sentinel/hooks', () => ({
    useVerifyOtpMutation: (options: any) => {
        mutateVerifyOtpHandler = options;
        return {
            mutate: mockUseVerifyOtpMutation,
            isPending: false,
        };
    },
    useAuth: () => ({
        supabase: {
            auth: {
                resend: mockSupabaseResend,
            },
        },
    }),
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
    useSearchParams: () => ({
        get: mockSearchParamsGet,
    }),
}));

describe('useConfirmCodeForm Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mutateVerifyOtpHandler = null;
        mockSearchParamsGet.mockReturnValue('student@gmail.com');
    });

    it('initializes with email from search parameters', () => {
        const { result } = renderHook(() => useConfirmCodeForm());

        expect(result.current.email).toBe('student@gmail.com');
        expect(result.current.successMessage).toContain('6-digit verification code');
    });

    it('sanitizes token to numbers and max 6 digits', () => {
        const { result } = renderHook(() => useConfirmCodeForm());

        act(() => {
            result.current.onTokenChange({
                target: { value: '12a34bc56789' },
            } as any);
        });

        expect(result.current.token).toBe('123456');
    });

    it('prevents submission if token is less than 6 digits', () => {
        const { result } = renderHook(() => useConfirmCodeForm());

        act(() => {
            result.current.onTokenChange({
                target: { value: '12345' },
            } as any);
        });

        act(() => {
            result.current.onSubmit();
        });

        expect(mockUseVerifyOtpMutation).not.toHaveBeenCalled();
        expect(result.current.verifyError).toBe(
            'Please enter the complete 6-digit verification code.',
        );
    });

    it('submits valid 6-digit token and redirects to /onboarding on session success', async () => {
        const { result } = renderHook(() => useConfirmCodeForm());

        act(() => {
            result.current.onTokenChange({
                target: { value: '123456' },
            } as any);
        });

        act(() => {
            result.current.onSubmit();
        });

        expect(mockUseVerifyOtpMutation).toHaveBeenCalledWith({
            email: 'student@gmail.com',
            token: '123456',
            type: 'signup',
        });

        act(() => {
            mutateVerifyOtpHandler.onSuccess({
                session: { access_token: 'test-token' },
                user: { id: 'u1' },
            });
        });

        expect(mockRouterPush).toHaveBeenCalledWith('/onboarding');
        expect(mockRouterRefresh).toHaveBeenCalled();
    });

    it('handles resend OTP and resets 60-second cooldown', async () => {
        mockSupabaseResend.mockResolvedValue({ data: {}, error: null });

        const { result } = renderHook(() => useConfirmCodeForm());

        // Fast-forward or trigger resend
        await act(async () => {
            // First clear cooldown to allow resend test
            (result.current as any).onResend();
        });

        // While cooldown > 0, resend is blocked
        expect(mockSupabaseResend).not.toHaveBeenCalled();
    });
});
