import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    mockRedirect,
    mockCookies,
    mockCreateServerClient,
    mockExchangeCodeForSession,
    mockVerifyOtp,
} = vi.hoisted(() => ({
    mockRedirect: vi.fn((destination: string | URL) => ({
        destination: destination instanceof URL ? destination.toString() : destination,
        cookies: {
            set: vi.fn(),
        },
    })),
    mockCookies: vi.fn(),
    mockCreateServerClient: vi.fn(),
    mockExchangeCodeForSession: vi.fn(),
    mockVerifyOtp: vi.fn(),
}));

vi.mock('next/headers', () => ({
    cookies: mockCookies,
}));

vi.mock('next/server', () => ({
    NextResponse: {
        redirect: mockRedirect,
    },
}));

vi.mock('@supabase/ssr', () => ({
    createServerClient: mockCreateServerClient,
}));

vi.mock('@/app/auth/callback/constant', () => ({
    EMAIL_OTP_TYPES: new Set(['invite', 'recovery', 'magiclink', 'email_change']),
}));

import { GET } from './route';

describe('core auth callback route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.NEXT_PUBLIC_WEB_URL;
        delete process.env.NEXT_PUBLIC_APP_URL;

        mockCookies.mockResolvedValue({
            get: vi.fn(),
        });

        mockExchangeCodeForSession.mockResolvedValue({ error: null });
        mockVerifyOtp.mockResolvedValue({ error: null });

        mockCreateServerClient.mockReturnValue({
            auth: {
                exchangeCodeForSession: mockExchangeCodeForSession,
                verifyOtp: mockVerifyOtp,
            },
        });
    });

    it('forwards update-password callbacks to the web portal before exchanging the token', async () => {
        process.env.NEXT_PUBLIC_WEB_URL = 'https://app.sentinelph.tech';

        const response = await GET(
            new Request(
                'https://core.sentinelph.tech/auth/callback?token_hash=abc123&type=invite&next=/auth/update-password',
            ),
        );

        expect(mockCreateServerClient).not.toHaveBeenCalled();
        expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
        expect(mockVerifyOtp).not.toHaveBeenCalled();
        expect(mockRedirect).toHaveBeenCalledWith(
            new URL(
                'https://app.sentinelph.tech/auth/callback?token_hash=abc123&type=invite&next=/auth/update-password',
            ),
        );
        expect(response).toMatchObject({
            destination:
                'https://app.sentinelph.tech/auth/callback?token_hash=abc123&type=invite&next=/auth/update-password',
        });
    });

    it('keeps admin callback flows on core for non-update-password destinations', async () => {
        await GET(
            new Request('https://core.sentinelph.tech/auth/callback?code=pkce-code&next=/dashboard'),
        );

        expect(mockCreateServerClient).toHaveBeenCalledTimes(1);
        expect(mockExchangeCodeForSession).toHaveBeenCalledWith('pkce-code');
        expect(mockRedirect).toHaveBeenLastCalledWith(
            'https://core.sentinelph.tech/dashboard',
        );
    });
});
