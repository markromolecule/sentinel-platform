import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterSchema } from '@sentinel/shared/schema';

// Hoisted state for React mock
const { hookState } = vi.hoisted(() => ({
    hookState: {
        values: [] as any[],
        index: 0,
    },
}));

vi.mock('react', () => {
    const createElement = (type: any, props: any, ...children: any[]) => ({
        type,
        props: {
            ...props,
            children:
                children.length === 0
                    ? props?.children
                    : children.length === 1
                      ? children[0]
                      : children,
        },
    });

    const mock = {
        useState: (initialValue: any) => {
            const currentIndex = hookState.index;
            if (hookState.values[currentIndex] === undefined) {
                hookState.values[currentIndex] = initialValue;
            }
            const value = hookState.values[currentIndex];
            const setValue = (newValue: any) => {
                if (typeof newValue === 'function') {
                    hookState.values[currentIndex] = newValue(hookState.values[currentIndex]);
                } else {
                    hookState.values[currentIndex] = newValue;
                }
            };
            hookState.index++;
            return [value, setValue];
        },
        useCallback: (fn: any) => fn,
        useMemo: (fn: any) => fn(),
        useRef: (initial: any) => ({ current: initial }),
        createElement,
    };

    return {
        ...mock,
        default: mock,
    };
});

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
}));

let capturedSignUpCallbacks: any = {};
const mockSignUpMutate = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useSignUpMutation: (options: any) => {
        capturedSignUpCallbacks = options;
        return {
            mutate: mockSignUpMutate,
            isPending: false,
        };
    },
}));

vi.mock('@/lib/auth/use-google-auth', () => ({
    useGoogleAuth: () => ({
        loading: false,
        error: null,
        signInWithGoogle: vi.fn(),
    }),
}));

const mockGetValues = vi.fn((key?: string) => {
    if (key === 'email') return 'registered.student@sentinel.ph';
    return {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'registered.student@sentinel.ph',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        terms: true,
    };
});

vi.mock('react-hook-form', () => ({
    useForm: () => ({
        control: {},
        formState: { errors: {} },
        handleSubmit: (fn: any) => fn,
        getValues: mockGetValues,
    }),
}));

vi.mock('@hookform/resolvers/zod', () => ({
    zodResolver: () => () => ({ values: {}, errors: {} }),
}));

import { useRegisterForm } from '@/app/(auth)/hooks/use-register-form';

describe('Register Flow and Navigation to Confirm Code', () => {
    beforeEach(() => {
        hookState.values = [];
        hookState.index = 0;
        vi.clearAllMocks();
    });

    describe('RegisterSchema contract', () => {
        it('accepts valid student registration data', () => {
            const result = RegisterSchema.safeParse({
                firstName: 'Maria',
                lastName: 'Santos',
                email: 'maria.santos@university.edu.ph',
                password: 'SecurePassword123!',
                confirmPassword: 'SecurePassword123!',
                terms: true,
            });
            expect(result.success).toBe(true);
        });

        it('rejects passwords that do not match', () => {
            const result = RegisterSchema.safeParse({
                firstName: 'Maria',
                lastName: 'Santos',
                email: 'maria.santos@university.edu.ph',
                password: 'SecurePassword123!',
                confirmPassword: 'DifferentPassword123!',
                terms: true,
            });
            expect(result.success).toBe(false);
        });
    });

    describe('useRegisterForm navigation behavior', () => {
        it('navigates to /(auth)/confirm-code with email parameter on signup success without session', () => {
            useRegisterForm();

            expect(capturedSignUpCallbacks.onSuccess).toBeDefined();

            // Simulate signup response where email confirmation is required (session is null)
            capturedSignUpCallbacks.onSuccess({
                session: null,
                user: { email: 'registered.student@sentinel.ph' },
            });

            expect(mockPush).toHaveBeenCalledWith({
                pathname: '/(auth)/confirm-code',
                params: { email: 'registered.student@sentinel.ph' },
            });
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('redirects directly to /(onboarding) if signup returned an active session', () => {
            useRegisterForm();

            expect(capturedSignUpCallbacks.onSuccess).toBeDefined();

            // Simulate immediate auto-confirmed session
            capturedSignUpCallbacks.onSuccess({
                session: { access_token: 'fake-jwt-token' },
                user: { email: 'registered.student@sentinel.ph' },
            });

            expect(mockReplace).toHaveBeenCalledWith('/(onboarding)');
            expect(mockPush).not.toHaveBeenCalled();
        });

        it('sets auth error when signup mutation fails', () => {
            useRegisterForm();

            expect(capturedSignUpCallbacks.onError).toBeDefined();
            capturedSignUpCallbacks.onError(new Error('User already registered'));

            // Error is set in state (index 2)
            expect(hookState.values[2]).toBe('User already registered');
        });
    });
});
