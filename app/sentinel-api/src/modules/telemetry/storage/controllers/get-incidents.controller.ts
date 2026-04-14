import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { TelemetryStorageService } from '../storage.service';
import { getTelemetryIncidentsSchema } from '../storage.dto';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';

export const getTelemetryIncidentsRoute = createRoute({
    method: 'get',
    path: '/incidents',
    tags: ['Telemetry'],
    summary: 'Get telemetry incidents',
    description: 'Retrieves reviewable telemetry incidents for exam monitoring.',
    request: getTelemetryIncidentsSchema.request,
    responses: {
        200: {
            description: 'Telemetry incidents fetched successfully.',
            content: {
                'application/json': {
                    schema: getTelemetryIncidentsSchema.response,
                },
            },
        },
    },
});

export const getTelemetryIncidentsRouteHandler: AppRouteHandler<
    typeof getTelemetryIncidentsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const role = supabaseUser?.user_metadata?.role;
    const institutionId = c.get('institutionId');
    const query = c.req.valid('query');

    assertAssessmentAccess(role);

    const scopedInstitutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: institutionId,
        requestedInstitutionId: query.institutionId,
    });

    const incidents = await TelemetryStorageService.getIncidents(
        c.get('dbClient'),
        query,
        scopedInstitutionId,
    );

    return c.json(
        {
            message: 'Telemetry incidents fetched successfully.',
            data: incidents,
        },
        200,
    );
};
