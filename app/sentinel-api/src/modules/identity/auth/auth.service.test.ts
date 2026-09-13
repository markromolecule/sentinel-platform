import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { supabaseAnon } from '../../../lib/supabase-anon';
import { supabaseAdmin } from '../../../lib/supabase-admin';

vi.mock('../../../lib/supabase-anon', () => ({
    supabaseAnon: {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            verifyOtp: vi.fn(),
        },
    },
}));

vi.mock('../../../lib/supabase-admin', () => ({
    supabaseAdmin: {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
        },
    },
}));

describe('AuthService.login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses supabaseAnon with captchaToken when captchaToken is provided (web flow)', async () => {
        const mockResult = {
            data: {
                user: { id: 'user-123' },
                session: { access_token: 'token-abc' },
            },
            error: null,
        };
        vi.mocked(supabaseAnon.auth.signInWithPassword).mockResolvedValue(mockResult as any);

        const result = await AuthService.login({
            email: 'student@example.com',
            password: 'password123',
            captchaToken: 'turnstile-token-xyz',
        });

        expect(supabaseAnon.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'student@example.com',
            password: 'password123',
            options: {
                captchaToken: 'turnstile-token-xyz',
            },
        });
        expect(supabaseAdmin.auth.signInWithPassword).not.toHaveBeenCalled();
        expect(result).toEqual(mockResult.data);
    });

    it('uses supabaseAdmin when captchaToken is omitted or whitespace (mobile / fallback flow)', async () => {
        const mockResult = {
            data: {
                user: { id: 'user-mobile' },
                session: { access_token: 'token-mobile' },
            },
            error: null,
        };
        vi.mocked(supabaseAdmin.auth.signInWithPassword).mockResolvedValue(mockResult as any);

        const result = await AuthService.login(
            {
                email: 'student@example.com',
                password: 'password123',
            },
            'mobile',
        );

        expect(supabaseAdmin.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'student@example.com',
            password: 'password123',
        });
        expect(supabaseAnon.auth.signInWithPassword).not.toHaveBeenCalled();
        expect(result).toEqual(mockResult.data);
    });

    it('throws error when authentication fails', async () => {
        const mockError = new Error('Invalid login credentials');
        vi.mocked(supabaseAdmin.auth.signInWithPassword).mockResolvedValue({
            data: { user: null, session: null },
            error: mockError,
        } as any);

        await expect(
            AuthService.login(
                {
                    email: 'student@example.com',
                    password: 'wrongpassword',
                },
                'mobile',
            ),
        ).rejects.toThrow('Invalid login credentials');
    });
});

describe('AuthService.register', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses supabaseAnon with captchaToken when captchaToken is provided (web registration)', async () => {
        const mockResult = {
            data: {
                user: { id: 'user-new' },
                session: null,
            },
            error: null,
        };
        vi.mocked(supabaseAnon.auth.signUp).mockResolvedValue(mockResult as any);

        const result = await AuthService.register({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            captchaToken: 'turnstile-token-xyz',
            terms: true,
        });

        expect(supabaseAnon.auth.signUp).toHaveBeenCalledWith({
            email: 'john@example.com',
            password: 'password123',
            options: {
                data: {
                    first_name: 'John',
                    last_name: 'Doe',
                    role: 'student',
                },
                captchaToken: 'turnstile-token-xyz',
            },
        });
        expect(supabaseAdmin.auth.signUp).not.toHaveBeenCalled();
        expect(result).toEqual({
            user: mockResult.data.user,
            session: null,
            requiresVerification: true,
        });
    });

    it('uses supabaseAdmin when captchaToken is omitted or clientType is mobile (mobile registration)', async () => {
        const mockResult = {
            data: {
                user: { id: 'user-mobile-reg' },
                session: null,
            },
            error: null,
        };
        vi.mocked(supabaseAdmin.auth.signUp).mockResolvedValue(mockResult as any);

        const result = await AuthService.register(
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                password: 'password123',
                terms: true,
            },
            'mobile',
        );

        expect(supabaseAdmin.auth.signUp).toHaveBeenCalledWith({
            email: 'jane@example.com',
            password: 'password123',
            options: {
                data: {
                    first_name: 'Jane',
                    last_name: 'Smith',
                    role: 'student',
                },
            },
        });
        expect(supabaseAnon.auth.signUp).not.toHaveBeenCalled();
        expect(result).toEqual({
            user: mockResult.data.user,
            session: null,
            requiresVerification: true,
        });
    });

    it('throws error when registration fails', async () => {
        const mockError = new Error('User already registered');
        vi.mocked(supabaseAdmin.auth.signUp).mockResolvedValue({
            data: { user: null, session: null },
            error: mockError,
        } as any);

        await expect(
            AuthService.register(
                {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane@example.com',
                    password: 'password123',
                    terms: true,
                },
                'mobile',
            ),
        ).rejects.toThrow('User already registered');
    });
});

