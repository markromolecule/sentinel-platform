import { describe, expect, it, vi } from 'vitest';
import { getUsersRouteHandler } from './get-users.controller';
import { UserService } from '../user.service';

describe('getUsersRouteHandler', () => {
    it('does not force student-only role filtering for institution-wide searches', async () => {
        const getUsersSpy = vi.spyOn(UserService, 'getUsers').mockResolvedValue([] as never);
        const json = vi.fn().mockReturnValue({ ok: true });
        const c = {
            get: vi.fn((key: string) => {
                if (key === 'supabaseUser') {
                    return { user_metadata: { role: 'instructor' } };
                }

                if (key === 'institutionId') {
                    return '11111111-1111-4111-8111-111111111111';
                }

                if (key === 'user') {
                    return {
                        user_profiles: {
                            user_id: '22222222-2222-4222-8222-222222222222',
                            department_id: '33333333-3333-4333-8333-333333333333',
                            course_id: '44444444-4444-4444-8444-444444444444',
                        },
                    };
                }

                if (key === 'dbClient') {
                    return {};
                }

                return undefined;
            }),
            req: {
                valid: vi.fn(() => ({
                    search: 'ma',
                    limit: 25,
                    offset: 0,
                    include_institution_users: true,
                })),
            },
            json,
        };

        await getUsersRouteHandler(c as any);

        expect(getUsersSpy).toHaveBeenCalledTimes(1);
        const args = getUsersSpy.mock.calls[0];
        expect(args?.[9]).toBeUndefined();
        expect(args?.[11]).toBe(true);
    });
});
