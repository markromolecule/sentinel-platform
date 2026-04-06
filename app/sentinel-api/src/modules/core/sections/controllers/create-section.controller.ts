import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '@/types/hono';
import { createSectionSchema } from '../sections.dto';
import { SectionService } from '../sections.service';

export const createSectionRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Sections'],
    summary: 'Create a section',
    description: 'Creates a new section.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createSectionSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createSectionSchema.response,
                },
            },
            description: 'Section created successfully',
        },
        400: { description: 'Bad Request' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const createSectionRouteHandler: AppRouteHandler<typeof createSectionRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');
        const institutionId = c.get('institutionId');

        const rawSection = await SectionService.createSection(c.get('dbClient'), {
            name: body.name,
            department_id: body.department_id,
            course_id: body.course_id,
            year_level: body.year_level,
            created_by: user.id,
            institutionId,
        });

        const section = {
            section_id: rawSection.section_id,
            section_name: rawSection.section_name,
            department_id: rawSection.department_id,
            course_id: rawSection.course_id,
            year_level: rawSection.year_level,
            created_at: rawSection.created_at,
        };

        return c.json(
            {
                message: 'Section created successfully',
                data: section,
            },
            201,
        );
    } catch (error: any) {
        console.error('Create section error:', error);
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2002' || code === '23505') {
            return c.json({ error: 'Section already exists for this department and year' }, 409);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
