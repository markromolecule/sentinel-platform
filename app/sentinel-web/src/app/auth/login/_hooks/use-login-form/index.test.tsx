import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { useLoginForm } from './index';

const {
    mockUseLoginMutation,
    mockRouterPush,
    mockRouterRefresh,
    mockSupabaseFrom,
    mockSupabaseSelect,
    mockSupabaseEq,
    mockSupabaseMaybeSingle,
    mockSupabaseSignOut,
    mockToastSuccess,
    mockToastInfo,
    mockToastError,
} = vi.hoisted(() => ({
    mockUseLoginMutation: vi.fn(),
    mockRouterPush: vi.fn(),
    mockRouterRefresh: vi.fn(),
    mockSupabaseFrom: vi.fn(),
    mockSupabaseSelect: vi.fn(),
    mockSupabaseEq: vi.fn(),
    mockSupabaseMaybeSingle: vi.fn(),
    mockSupabaseSignOut: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastInfo: vi.fn(),
    mockToastError: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useLoginMutation: mockUseLoginMutation,
    LoginError: class LoginError extends Error {
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

vi.mock('@/data/supabase/client', () => ({
    createSupabaseClient: () => ({
        from: mockSupabaseFrom,
        auth: {
            signOut: mockSupabaseSignOut,
        },
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: mockToastSuccess,
        info: mockToastInfo,
        error: mockToastError,
    },
}));

function createUser(overrides: Partial<User> = {}): User {
    return {
        id: 'student-user-1',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2026-07-07T00:00:00.000Z',
        email: 'student@example.com',
        ...overrides,
    } as User;
}

describe('useLoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabaseFrom.mockReturnValue({
            select: mockSupabaseSelect,
        });
        mockSupabaseSelect.mockReturnValue({
            eq: mockSupabaseEq,
        });
        mockSupabaseEq.mockReturnValue({
            maybeSingle: mockSupabaseMaybeSingle,
        });
        mockUseLoginMutation.mockImplementation((args) => ({
            mutate: vi.fn(),
            isPending: false,
            ...args,
        }));
    });

    it('routes a password-login student into the student portal when role metadata is missing', async () => {
        mockSupabaseMaybeSingle.mockResolvedValue({
            data: {
                student_number: '2024-0001',
                department_id: 'department-1',
            },
            error: null,
        });

        let loginSuccessHandler: ((payload: { user: User | null }) => Promise<void>) | undefined;
        mockUseLoginMutation.mockImplementation(({ onSuccess }) => {
            loginSuccessHandler = onSuccess;
            return {
                mutate: vi.fn(),
                isPending: false,
            };
        });

        renderHook(() => useLoginForm());

        await act(async () => {
            await loginSuccessHandler?.({
                user: createUser({
                    user_metadata: {},
                }),
            });
        });

        await waitFor(() => {
            expect(mockRouterRefresh).toHaveBeenCalled();
        });

        expect(mockRouterPush).toHaveBeenCalledWith('/student/classroom');
        expect(mockToastSuccess).toHaveBeenCalledWith('Welcome back Student!');
        expect(mockSupabaseSignOut).not.toHaveBeenCalled();
        expect(mockToastError).not.toHaveBeenCalled();
    });

    it('signs out unsupported manual logins instead of routing them into the student portal', async () => {
        mockSupabaseMaybeSingle.mockResolvedValue({
            data: null,
            error: null,
        });

        let loginSuccessHandler: ((payload: { user: User | null }) => Promise<void>) | undefined;
        mockUseLoginMutation.mockImplementation(({ onSuccess }) => {
            loginSuccessHandler = onSuccess;
            return {
                mutate: vi.fn(),
                isPending: false,
            };
        });

        const { result } = renderHook(() => useLoginForm());

        await act(async () => {
            await loginSuccessHandler?.({
                user: createUser({
                    user_metadata: {
                        role: 'support',
                    },
                }),
            });
        });

        await waitFor(() => {
            expect(mockSupabaseSignOut).toHaveBeenCalled();
        });

        expect(result.current.authError).toBe(
            'Access Denied. This portal is for Students and Instructors only.',
        );
        expect(mockToastError).toHaveBeenCalledWith('Access Denied.');
        expect(mockRouterPush).not.toHaveBeenCalled();
    });
});
