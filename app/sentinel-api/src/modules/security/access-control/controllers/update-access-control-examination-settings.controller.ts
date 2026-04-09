import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../../types/hono';
import { updateAccessControlExaminationSettingsSchema } from '../access-control.dto';
import { assertSupportAccess } from '../services/access-control-authorization.service';
import { AccessControlExaminationSettingsService } from '../services/access-control-examination-settings.service';

export const updateAccessControlExaminationSettingsRoute = createRoute({
    method: 'put',
    path: '/examination-settings',
    tags: ['Access Control'],
    summary: 'Update support-managed examination settings',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: updateAccessControlExaminationSettingsSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Examination settings updated successfully.',
            content: {
                'application/json': {
                    schema: updateAccessControlExaminationSettingsSchema.response,
                },
            },
        },
    },
});

export const updateAccessControlExaminationSettingsRouteHandler: AppRouteHandler<
    typeof updateAccessControlExaminationSettingsRoute
> = async (c) => {
    const supabaseUser = c.get('supabaseUser') as any;
    assertSupportAccess(supabaseUser?.user_metadata?.role);

    const body = c.req.valid('json');
    const user = c.get('user');
    const data = await AccessControlExaminationSettingsService.updateExaminationSettings(
        c.get('dbClient'),
        body,
        user?.id,
    );

    return c.json({ message: 'Examination settings updated successfully.', data });
};
