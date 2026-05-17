import { createRoute } from '@hono/zod-openapi';
import { requireActivePermission } from '../../../../lib/permissions';
import { respondWithRouteError } from '../../../../lib/route-error-response';
import { type AppRouteHandler } from '../../../../types/hono';
import { getInstitutionsSchema } from '../institution.dto';
import { InstitutionService } from '../institution.service';

export const getInstitutionsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Institutions'],
    summary: 'Get all institutions',
    description: 'Retrieves all institutions.',
    request: getInstitutionsSchema.request,
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getInstitutionsSchema.response,
                },
            },
            description: 'Institutions fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getInstitutionsRouteHandler: AppRouteHandler<typeof getInstitutionsRoute> = async (
    c,
) => {
    try {
        requireActivePermission(
            c,
            'institutions:view',
            'Forbidden. Missing institutions:view permission.',
        );

        const { search, parentInstitutionId, institutionKind } = c.req.valid('query');
        const role = c.get('role');
        const requesterInstitutionId = c.get('institutionId');

        const rawInstitutions = await InstitutionService.getInstitutions(c.get('dbClient'), {
            search,
            parentInstitutionId,
            institutionKind,
        });

        let institutions = rawInstitutions;

        if (role !== 'support' && requesterInstitutionId) {
            const db = c.get('dbClient');
            const userInst = await db
                .selectFrom('institutions')
                .select(['id', 'parent_institution_id', 'institution_kind'])
                .where('id', '=', requesterInstitutionId)
                .executeTakeFirst();

            if (!userInst) {
                institutions = [];
            } else {
                const allowedIds = [userInst.id];
                if (userInst.parent_institution_id) {
                    allowedIds.push(userInst.parent_institution_id);
                } else {
                    const branches = await db
                        .selectFrom('institutions')
                        .select('id')
                        .where('parent_institution_id', '=', userInst.id)
                        .execute();
                    allowedIds.push(...branches.map((b) => b.id));
                }
                institutions = rawInstitutions.filter((inst) => allowedIds.includes(inst.id));
            }
        }

        return c.json(
            {
                message: 'Institutions fetched successfully',
                data: institutions,
            },
            200,
        );
    } catch (error: any) {
        return respondWithRouteError(c, error, 'Fetch institutions error:');
    }
};
