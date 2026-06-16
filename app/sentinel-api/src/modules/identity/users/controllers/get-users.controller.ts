import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getUsersSchema } from '../user.dto';
import { UserService } from '../user.service';
import { SUPPORT_ASSIGNABLE_ROLE_NAMES } from '@sentinel/shared/constants';

const SUPPORT_USER_ROLE_NAMES = [...SUPPORT_ASSIGNABLE_ROLE_NAMES, 'support'] as const;

export const getUsersRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Users'],
    summary: 'Get all users',
    description: 'Retrieves all users.',
    request: getUsersSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getUsersSchema.response,
                },
            },
            description: 'Users fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getUsersRouteHandler: AppRouteHandler<typeof getUsersRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');
        const user = c.get('user');

        if (
            role !== 'admin' &&
            role !== 'superadmin' &&
            role !== 'support' &&
            role !== 'instructor'
        ) {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        if (role === 'admin' && !institutionId) {
            return c.json(
                {
                    message: 'No institution assigned to this admin',
                    data: [],
                },
                200,
            );
        }

        const {
            search,
            limit,
            offset,
            department_id,
            institution_id,
            role: rawRoleFilter,
            include_institution_users,
        } = c.req.valid('query');
        const parsedRoleFilters = rawRoleFilter
            ?.split(',')
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean);
        const scopedInstitutionId =
            role === 'support' || role === 'superadmin'
                ? institution_id || undefined
                : ((institution_id || institutionId) as string | undefined);
        const scopedDepartmentId =
            role === 'support' || role === 'superadmin'
                ? null
                : department_id || user.user_profiles?.department_id || null;
        const scopedRoleFilters =
            role === 'support'
                ? (() => {
                      const filteredRoles =
                          parsedRoleFilters?.filter((roleName) =>
                              SUPPORT_USER_ROLE_NAMES.includes(
                                  roleName as (typeof SUPPORT_USER_ROLE_NAMES)[number],
                              ),
                          ) ?? [];

                      return filteredRoles.length > 0
                          ? filteredRoles
                          : [...SUPPORT_USER_ROLE_NAMES];
                  })()
                : parsedRoleFilters;
        const scopedRoleFilter = include_institution_users
            ? scopedRoleFilters?.[0]
            : scopedRoleFilters?.[0] ||
              (role === 'instructor' && !scopedRoleFilters?.length ? 'student' : undefined);
        const rawUsers = await UserService.getUsers(
            c.get('dbClient'),
            scopedInstitutionId,
            search,
            limit,
            offset,
            user.user_profiles?.user_id,
            role,
            scopedDepartmentId,
            user.user_profiles?.course_id || null,
            scopedRoleFilter,
            scopedRoleFilters,
            include_institution_users,
        );

        return c.json(
            {
                message: 'Users fetched successfully',
                data: rawUsers,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch users error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
