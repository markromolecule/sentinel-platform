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
