import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { TelemetryStorageService } from '../storage.service';
import { getTelemetryIncidentSchema } from '../storage.dto';
import { resolveAssessmentInstitutionId } from '../../../examination/assessment/assessment-access';
import { requireActivePermission } from '../../../../lib/permissions';

export const getTelemetryIncidentRoute = createRoute({
    method: 'get',
    path: '/incidents/{incidentId}',
    tags: ['Telemetry'],
    summary: 'Get telemetry incident',
    description: 'Retrieves one telemetry incident for review.',
    request: getTelemetryIncidentSchema.request,
    responses: {
        200: {
            description: 'Telemetry incident fetched successfully.',
            content: {
                'application/json': {
                    schema: getTelemetryIncidentSchema.response,
                },
            },
        },
    },
});

export const getTelemetryIncidentRouteHandler: AppRouteHandler<
    typeof getTelemetryIncidentRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const role = c.get('role') || supabaseUser?.user_metadata?.role;
    const institutionId = c.get('institutionId');
    const user = c.get('user');
    const { incidentId } = c.req.valid('param');

    requireActivePermission(c, 'incidents:view');

    const scopedInstitutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: institutionId,
    });

    const userScope = {
        role,
        userId: user.id,
        departmentId: user?.user_profiles?.department_id ?? null,
        courseId: user?.user_profiles?.course_id ?? null,
    };

    const incident = await TelemetryStorageService.getIncidentById(
        c.get('dbClient'),
        incidentId,
        scopedInstitutionId,
        userScope,
    );

    return c.json(
        {
            message: 'Telemetry incident fetched successfully.',
            data: incident,
        },
        200,
    );
};
