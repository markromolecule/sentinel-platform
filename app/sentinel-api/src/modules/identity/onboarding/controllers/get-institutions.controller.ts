import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { getInstitutionsSchema } from '../onboarding.dto';
import { OnboardingService } from '../onboarding.service';

export const getOnboardingInstitutionsRoute = createRoute({
    method: 'get',
    path: '/institutions',
    tags: ['Onboarding'],
    summary: 'Get list of institutions during onboarding',
    description: 'Retrieves all institutions suitable for a new student.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getInstitutionsSchema.response,
                },
            },
            description: 'Institutions fetched successfully',
        },
        500: { description: 'Internal Server Error' },
    },
});

export const getOnboardingInstitutionsRouteHandler: AppRouteHandler<
    typeof getOnboardingInstitutionsRoute
> = async (c) => {
    try {
        const rawInstitutions = await OnboardingService.getInstitutions(c.get('dbClient'));

        const institutions = rawInstitutions.map((inst) => ({
            institution_id: inst.id,
            institution_name: inst.name,
            institution_code: inst.code,
            created_at: inst.created_at,
        }));

        return c.json(
            {
                message: 'Institutions fetched successfully',
                data: institutions,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch institutions error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
