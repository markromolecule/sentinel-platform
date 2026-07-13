import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getUserRouteHandler } from './get-user.controller';
import { UserService } from '../user.service';
import { getUserActivePermissions } from '../../../security/permission/data/get-user-active-permissions';

vi.mock('../user.service', () => ({
    UserService: {
        getUserById: vi.fn(),
    },
}));

vi.mock('../../../security/permission/data/get-user-active-permissions', () => ({
    getUserActivePermissions: vi.fn(),
}));

describe('getUserRouteHandler', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        vi.clearAllMocks();
    });

    it('successfully retrieves user details with resolved role', async () => {
        const mockUser = { id: 'target-user-id', name: 'John Doe' };
        vi.mocked(UserService.getUserById).mockResolvedValue(mockUser as any);
        vi.mocked(getUserActivePermissions).mockResolvedValue(['perm1', 'perm2']);

        const json = vi.fn();
        const c = {
            get: vi.fn((key: string) => {
                if (key === 'supabaseUser') {
                    return { app_metadata: { role: 'admin' } };
                }
                if (key === 'institutionId') {
                    return 'inst-id';
                }
                if (key === 'user') {
                    return { id: 'requester-id', user_profiles: { department_id: 'dept-id', course_id: 'course-id' } };
                }
                if (key === 'dbClient') {
                    return {};
                }
                return undefined;
            }),
            req: {
                valid: vi.fn((type: string) => {
                    if (type === 'param') {
                        return { id: 'target-user-id' };
                    }
                    return {};
                }),
            },
            json,
        };

        await getUserRouteHandler(c as any);

        expect(UserService.getUserById).toHaveBeenCalledWith(
            expect.any(Object),
            'target-user-id',
            'inst-id',
            'admin',
            'requester-id',
            'dept-id',
            'course-id'
        );
        expect(getUserActivePermissions).toHaveBeenCalledWith(expect.any(Object), 'target-user-id');
        expect(json).toHaveBeenCalledWith(
            {
                message: 'User fetched successfully',
                data: {
                    ...mockUser,
                    active_permission_keys: ['perm1', 'perm2'],
                },
            },
            200
        );
    });

    it('returns 404 and suppresses console.error when user is not found', async () => {
        vi.mocked(UserService.getUserById).mockRejectedValue({ status: 404, message: 'User not found' });

        const json = vi.fn();
        const c = {
            get: vi.fn((key: string) => {
                if (key === 'supabaseUser') {
                    return { user_metadata: { role: 'instructor' } };
                }
                if (key === 'user') {
                    return { id: 'requester-id' };
                }
                return {};
            }),
            req: {
                valid: vi.fn(() => ({ id: 'target-user-id' })),
            },
            json,
        };

        await getUserRouteHandler(c as any);

        expect(json).toHaveBeenCalledWith({ error: 'User not found' }, 404);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns 500 and logs console.error on unexpected database error', async () => {
        vi.mocked(UserService.getUserById).mockRejectedValue(new Error('DB failure'));

        const json = vi.fn();
        const c = {
            get: vi.fn((key: string) => {
                if (key === 'supabaseUser') {
                    return { user_metadata: { role: 'instructor' } };
                }
                if (key === 'user') {
                    return { id: 'requester-id' };
                }
                return {};
            }),
            req: {
                valid: vi.fn(() => ({ id: 'target-user-id' })),
            },
            json,
        };

        await getUserRouteHandler(c as any);

        expect(json).toHaveBeenCalledWith({ error: 'Internal Server Error' }, 500);
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
