import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { requireActivePermission } from '../../../../lib/permissions';
import { getExaminationConfigurationDefaultsSchema } from '../configuration.dto';
import { ConfigurationService } from '../configuration.service';

export const getExaminationConfigurationDefaultsRoute = createRoute({
    method: 'get',
    path: '/defaults',
    tags: ['Configuration'],
    summary: 'Get effective examination configuration defaults',
    responses: {
        200: {
            description: 'Examination configuration defaults fetched successfully',
            content: {
                'application/json': {
                    schema: getExaminationConfigurationDefaultsSchema.response,
                },
            },
        },
    },
});

export const getExaminationConfigurationDefaultsRouteHandler: AppRouteHandler<
    typeof getExaminationConfigurationDefaultsRoute
> = async (c) => {
    requireActivePermission(c, ['examinations:create', 'examinations:update']);

    const defaults = await ConfigurationService.getExaminationConfigurationDefaults(
        c.get('dbClient'),
    );

    return c.json({
        message: 'Examination configuration defaults fetched successfully',
        data: defaults,
    });
};
