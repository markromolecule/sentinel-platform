import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockInviteUserByEmail, mockGenerateLink, mockUpdateUserById } = vi.hoisted(() => ({
    mockInviteUserByEmail: vi.fn(),
    mockGenerateLink: vi.fn(),
    mockUpdateUserById: vi.fn(),
}));

vi.mock('../../../../lib/supabase-admin', () => ({
    supabaseAdmin: {
        auth: {
            admin: {
                inviteUserByEmail: mockInviteUserByEmail,
                generateLink: mockGenerateLink,
                updateUserById: mockUpdateUserById,
            },
        },
    },
}));

import { UserInviteService } from './user-invite.service';

describe('UserInviteService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.NEXT_PUBLIC_CORE_URL;
        delete process.env.CORE_URL;
        delete process.env.NEXT_PUBLIC_SUPPORT_URL;
        delete process.env.SUPPORT_URL;
        delete process.env.FRONTEND_URL;
        delete process.env.NEXT_PUBLIC_APP_URL;
        delete process.env.NEXT_PUBLIC_WEB_URL;
        process.env.NODE_ENV = 'production';

        mockInviteUserByEmail.mockResolvedValue({
            data: {
                user: {
                    id: 'user-123',
                },
            },
            error: null,
        });
        mockUpdateUserById.mockResolvedValue({
            data: {},
            error: null,
        });
    });

    it('falls back to the core domain when the core env URL points to the web app', async () => {
        process.env.NEXT_PUBLIC_CORE_URL = 'https://app.sentinelph.tech';

        await UserInviteService.inviteUserAuth(
            {
                firstName: 'Core',
                lastName: 'Admin',
                email: 'admin@example.com',
                role: 'admin',
                department: '',
                course: '',
                courseIds: [],
                studentNo: '',
                employeeNo: '',
                institution: '',
            },
            'https://support.sentinelph.tech',
        );

        expect(mockInviteUserByEmail).toHaveBeenCalledWith(
            'admin@example.com',
            expect.objectContaining({
                redirectTo: 'https://core.sentinelph.tech/auth/callback?next=/auth/update-password',
            }),
        );
    });

    it('falls back to the support domain when the support env URL points to the web app', async () => {
        process.env.NEXT_PUBLIC_SUPPORT_URL = 'https://app.sentinelph.tech';

        await UserInviteService.inviteUserAuth(
            {
                firstName: 'Support',
                lastName: 'User',
                email: 'support@example.com',
                role: 'support',
                department: '',
                course: '',
                courseIds: [],
                studentNo: '',
                employeeNo: '',
                institution: '',
            },
            'https://core.sentinelph.tech',
        );

        expect(mockInviteUserByEmail).toHaveBeenCalledWith(
            'support@example.com',
            expect.objectContaining({
                redirectTo:
                    'https://support.sentinelph.tech/auth/callback?next=/auth/update-password',
            }),
        );
    });

    it('keeps instructor invites on the web app even when sent from the core portal', async () => {
        process.env.NEXT_PUBLIC_APP_URL = 'https://app.sentinelph.tech';

        await UserInviteService.inviteUserAuth(
            {
                firstName: 'Web',
                lastName: 'Instructor',
                email: 'instructor@example.com',
                role: 'instructor',
                department: '',
                course: '',
                courseIds: [],
                studentNo: '',
                employeeNo: '',
                institution: '',
            },
            'https://core.sentinelph.tech',
        );

        expect(mockInviteUserByEmail).toHaveBeenCalledWith(
            'instructor@example.com',
            expect.objectContaining({
                redirectTo: 'https://app.sentinelph.tech/auth/callback?next=/auth/update-password',
            }),
        );
    });
});
