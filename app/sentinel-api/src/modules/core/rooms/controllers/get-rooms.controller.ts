import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getRoomsSchema } from '../room.dto';
import { RoomService } from '../room.service';
import {
    buildRequesterAcademicScope,
    resolveAcademicQueryScope,
} from '../../../_shared/academic-scope';

export const getRoomsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Rooms'],
    summary: 'Get all rooms',
    description: 'Retrieves all rooms.',
    request: getRoomsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getRoomsSchema.response,
                },
            },
            description: 'Rooms fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getRoomsRouteHandler: AppRouteHandler<typeof getRoomsRoute> = async (c) => {
    try {
        requireActivePermission(c, 'rooms:view', 'Forbidden. Missing rooms:view permission.');
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        // Regular admins MUST have an institution assigned
        if (role !== 'superadmin' && role !== 'support' && !institutionId) {
            return c.json(
                {
                    message: 'No institution assigned to this user',
                    data: [],
                },
                200,
            );
        }

        const { search, institutionId: queryInstitutionId } = c.req.valid('query');
        const scope = buildRequesterAcademicScope({
            requesterRole: role,
            requesterInstitutionId: institutionId,
            requesterDepartmentId: c.get('user').user_profiles?.department_id ?? null,
            requesterCourseId: c.get('user').user_profiles?.course_id ?? null,
        });
        const queryScope = resolveAcademicQueryScope(scope, {
            requestedInstitutionId: queryInstitutionId,
        });

        const rooms = await RoomService.getRooms(
            c.get('dbClient'),
            queryScope.institutionId,
            search,
        );

        return c.json(
            {
                message: 'Rooms fetched successfully',
                data: rooms,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Fetch rooms error:');
    }
};
