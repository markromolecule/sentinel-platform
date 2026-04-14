import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { TelemetryStorageService } from '../storage.service';
import { updateTelemetryIncidentSchema } from '../storage.dto';
import {
    assertAssessmentAccess,
    resolveAssessmentInstitutionId,
} from '../../../examination/assessment/assessment-access';

export const updateTelemetryIncidentRoute = createRoute({
    method: 'patch',
    path: '/incidents/{incidentId}',
    tags: ['Telemetry'],
    summary: 'Update telemetry incident review state',
    description: 'Updates the status or evidence URL for a telemetry incident.',
    request: updateTelemetryIncidentSchema.request,
    responses: {
        200: {
            description: 'Telemetry incident updated successfully.',
            content: {
                'application/json': {
                    schema: updateTelemetryIncidentSchema.response,
                },
            },
        },
    },
});

export const updateTelemetryIncidentRouteHandler: AppRouteHandler<
    typeof updateTelemetryIncidentRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    const role = supabaseUser?.user_metadata?.role;
    const institutionId = c.get('institutionId');
    const user = c.get('user');
    const { incidentId } = c.req.valid('param');
    const body = c.req.valid('json');

    assertAssessmentAccess(role);

    const scopedInstitutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId: institutionId,
    });

    const incident = await TelemetryStorageService.updateIncidentReview(
        c.get('dbClient'),
        incidentId,
        body,
        user.id,
        scopedInstitutionId,
    );

    return c.json(
        {
            message: 'Telemetry incident updated successfully.',
            data: incident,
        },
        200,
    );
};
