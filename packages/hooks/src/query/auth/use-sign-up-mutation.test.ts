import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSignUpMutation } from './use-sign-up-mutation';

const { mockApi, mockSetSession } = vi.hoisted(() => ({
    mockApi: vi.fn(),
    mockSetSession: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
    useMutation: vi.fn((options: any) => ({
        mutate: options.mutationFn,
        mutateAsync: options.mutationFn,
    })),
}));

vi.mock('../../auth-provider', () => ({
    useAuth: vi.fn(() => ({
        supabase: {
            auth: {
                setSession: mockSetSession,
            },
        },
    })),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => mockApi),
}));

describe('useSignUpMutation Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should forward captchaToken when present in credentials', async () => {
        mockApi.mockResolvedValue({
            user: { id: 'user-1' },
            session: null,
            requiresVerification: true,
        });

        const mutation = useSignUpMutation();
        const payload = {
            email: 'student@gmail.com',
            password: 'Password123!',
            captchaToken: 'test-turnstile-token',
            options: {
                data: {
                    first_name: 'Juan',
                    last_name: 'Dela Cruz',
                },
            },
        };

        const result = await (mutation as any).mutate(payload);

        expect(mockApi).toHaveBeenCalledWith('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'student@gmail.com',
                password: 'Password123!',
                firstName: 'Juan',
                lastName: 'Dela Cruz',
                terms: true,
                captchaToken: 'test-turnstile-token',
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        expect(result.requiresVerification).toBe(true);
    });

    it('should forward captchaToken when nested in options', async () => {
        mockApi.mockResolvedValue({
            user: { id: 'user-2' },
            session: { access_token: 'acc-tok', refresh_token: 'ref-tok' },
        });

        const mutation = useSignUpMutation();
        const payload = {
            email: 'student2@gmail.com',
            password: 'Password123!',
            options: {
                data: {
                    first_name: 'Maria',
                    last_name: 'Santos',
                },
                captchaToken: 'nested-turnstile-token',
            },
        };

        await (mutation as any).mutate(payload);

        expect(mockApi).toHaveBeenCalledWith('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'student2@gmail.com',
                password: 'Password123!',
                firstName: 'Maria',
                lastName: 'Santos',
                terms: true,
                captchaToken: 'nested-turnstile-token',
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        expect(mockSetSession).toHaveBeenCalledWith({
            access_token: 'acc-tok',
            refresh_token: 'ref-tok',
        });
    });

    it('should set captchaToken to undefined if omitted or whitespace', async () => {
        mockApi.mockResolvedValue({
            user: { id: 'user-3' },
            session: null,
        });

        const mutation = useSignUpMutation();
        const payload = {
            email: 'student3@gmail.com',
            password: 'Password123!',
            captchaToken: '   ',
            options: {
                data: {
                    first_name: 'Pedro',
                    last_name: 'Penduko',
                },
            },
        };

        await (mutation as any).mutate(payload);

        expect(mockApi).toHaveBeenCalledWith('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'student3@gmail.com',
                password: 'Password123!',
                firstName: 'Pedro',
                lastName: 'Penduko',
                terms: true,
                captchaToken: undefined,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });
});
