import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { TelemetryStorageService } from '../storage.service';
import { getTelemetryIncidentSchema } from '../storage.dto';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';

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
    const role = supabaseUser?.user_metadata?.role;
    const institutionId = c.get('institutionId');
    const { incidentId } = c.req.valid('param');

    assertAssessmentAccess(role);

    const scopedInstitutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: institutionId,
    });

    const incident = await TelemetryStorageService.getIncidentById(
        c.get('dbClient'),
        incidentId,
        scopedInstitutionId,
    );

    return c.json(
        {
            message: 'Telemetry incident fetched successfully.',
            data: incident,
        },
        200,
    );
};
