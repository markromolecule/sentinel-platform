import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { updateUserRouteHandler } from './update-user.controller';
import { UserService } from '../user.service';

vi.mock('../user.service', () => ({
    UserService: {
        updateUser: vi.fn(),
    },
}));

vi.mock('../../../_shared/academic-scope', () => ({
    buildRequesterAcademicScope: vi.fn().mockReturnValue({}),
    resolveScopedUserMutationValues: vi.fn().mockImplementation((db, scope, body) => body),
}));

describe('updateUserRouteHandler', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        vi.clearAllMocks();
    });

    it('successfully updates user details with resolved role', async () => {
        const mockUser = { id: 'target-user-id', name: 'John Doe Updated' };
        vi.mocked(UserService.updateUser).mockResolvedValue(mockUser as any);

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
                    return {
                        id: 'requester-id',
                        user_profiles: { department_id: 'dept-id', course_id: 'course-id' },
                    };
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
                    if (type === 'json') {
                        return { firstName: 'John' };
                    }
                    return {};
                }),
            },
            json,
        };

        await updateUserRouteHandler(c as any);

        expect(UserService.updateUser).toHaveBeenCalledWith(
            expect.any(Object),
            'target-user-id',
            { firstName: 'John' },
            'admin',
            'inst-id',
            'requester-id',
            'dept-id',
            'course-id',
        );
        expect(json).toHaveBeenCalledWith(
            {
                message: 'User updated successfully',
                data: mockUser,
            },
            200,
        );
    });

    it('returns 404 and suppresses console.error when user profile not found after update', async () => {
        vi.mocked(UserService.updateUser).mockRejectedValue({
            status: 404,
            message: 'User profile not found after update',
        });

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
                valid: vi.fn((type: string) => {
                    if (type === 'param') return { id: 'target-user-id' };
                    return {};
                }),
            },
            json,
        };

        await updateUserRouteHandler(c as any);

        expect(json).toHaveBeenCalledWith({ error: 'User not found' }, 404);
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
});
