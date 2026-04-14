import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { verifyEligibilitySchema } from '../access.dto';
import { AccessService } from '../access.service';

export const verifyEligibilityRoute = createRoute({
    method: 'get',
    path: '/:examId/eligibility',
    tags: ['Examination Access'],
    summary: 'Verify student eligibility',
    description: 'Checks if the requesting student is currently eligible to enter this exam (enrollment, schedule, active constraints).',
    request: {
        params: verifyEligibilitySchema.params,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: verifyEligibilitySchema.response,
                },
            },
            description: 'Eligibility verification returned',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const verifyEligibilityRouteHandler: AppRouteHandler<typeof verifyEligibilityRoute> = async (c) => {
    try {
        const { examId } = c.req.valid('param');
        const user = c.get('user');

        const result = await AccessService.verifyExamEligibility(
            c.get('dbClient'),
            user.id,
            examId,
        );

        return c.json(
            {
                message: 'Eligibility assessed successfully',
                data: result,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Verify Eligibility Error:');
    }
};
