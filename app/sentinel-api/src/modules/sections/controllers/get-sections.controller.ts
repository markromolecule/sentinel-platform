import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { getSectionsSchema } from '../sections.dto';
import { SectionService } from '../sections.service';

export const getSectionsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Sections'],
    summary: 'Get all sections',
    description: 'Retrieves all sections.',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: getSectionsSchema.response,
                },
            },
            description: 'Sections fetched successfully',
        },
        500: {
            description: 'Internal Server Error',
        },
    },
});

export const getSectionsRouteHandler: AppRouteHandler<typeof getSectionsRoute> = async (c) => {
    try {
        const supabaseUser = c.get('supabaseUser') as any;
        const role = supabaseUser?.user_metadata?.role;
        const institutionId = c.get('institutionId');

        if (role !== 'admin' && role !== 'superadmin') {
            return c.json({ error: 'Forbidden. Insufficient permissions.' }, 403 as any);
        }

        if (role !== 'superadmin' && !institutionId) {
            return c.json({ message: 'No institution assigned to this admin', data: [] }, 200);
        }

        const rawSections = await SectionService.getSections(c.get('dbClient'), institutionId);

        const sections = rawSections.map((section: any) => ({
            section_id: section.section_id,
            section_name: section.section_name,
            department_id: section.department_id,
            course_id: section.course_id,
            year_level: section.year_level,
            created_at: section.created_at,
            updated_at: section.updated_at,
            created_by: section.creator_first_name
                ? `${section.creator_first_name} ${section.creator_last_name}`
                : section.created_by,
            updated_by: section.updater_first_name
                ? `${section.updater_first_name} ${section.updater_last_name}`
                : section.updated_by,
        }));

        return c.json(
            {
                message: 'Sections fetched successfully',
                data: sections,
            },
            200,
        );
    } catch (error: any) {
        console.error('Fetch sections error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
