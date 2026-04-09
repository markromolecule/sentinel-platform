import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { getAccessControlExaminationSettingsSchema } from '../access-control.dto';
import { assertSupportAccess } from '../services/access-control-authorization.service';
import { AccessControlExaminationSettingsService } from '../services/access-control-examination-settings.service';

export const getAccessControlExaminationSettingsRoute = createRoute({
    method: 'get',
    path: '/examination-settings',
    tags: ['Access Control'],
    summary: 'Get support-managed examination settings',
    responses: {
        200: {
            description: 'Examination settings fetched successfully.',
            content: {
                'application/json': {
                    schema: getAccessControlExaminationSettingsSchema.response,
                },
            },
        },
    },
});

export const getAccessControlExaminationSettingsRouteHandler: AppRouteHandler<
    typeof getAccessControlExaminationSettingsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const data = await AccessControlExaminationSettingsService.getExaminationSettings(
        c.get('dbClient'),
    );

    return c.json({ message: 'Examination settings fetched successfully.', data });
};
