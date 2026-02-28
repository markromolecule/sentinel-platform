import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { getInstitutionSchema } from '../onboarding.dto';
import { OnboardingService } from '../onboarding.service';

export const getInstitutionRoute = createRoute({
    method: 'get',
    path: '/institution',
    tags: ['Onboarding'],
    summary: 'Get default institution',
    description: 'Retrieves the default institution to bind explicitly a student to.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getInstitutionSchema.response,
                },
            },
            description: 'Institution fetched successfully',
        },
        404: { description: 'Not found' },
        500: { description: 'Internal Server Error' },
    },
});

export const getInstitutionRouteHandler: AppRouteHandler<typeof getInstitutionRoute> = async (
    c,
) => {
    try {
        const rawInstitution = await OnboardingService.getDefaultInstitution();

        if (!rawInstitution) {
            return c.json({ error: 'Default institution not found' }, 404);
        }

        const institution = {
            institution_id: rawInstitution.id,
            institution_name: rawInstitution.name,
            institution_code: rawInstitution.code,
            created_at: rawInstitution.created_at,
        };

        return c.json(
            {
                message: 'Institution fetched successfully',
                data: institution,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch institution error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
