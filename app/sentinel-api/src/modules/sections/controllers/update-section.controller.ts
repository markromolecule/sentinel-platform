import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { updateSectionSchema } from '../sections.dto';
import { SectionService } from '../sections.service';

export const updateSectionRoute = createRoute({
    method: 'put',
    path: '/{id}',
    tags: ['Sections'],
    summary: 'Update a section',
    description: 'Updates an existing section.',
    request: {
        params: updateSectionSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: updateSectionSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: updateSectionSchema.response,
                },
            },
            description: 'Section updated successfully',
        },
        400: { description: 'Bad Request' },
        404: { description: 'Section not found' },
        409: { description: 'Conflict' },
        500: { description: 'Internal Server Error' },
    },
});

export const updateSectionRouteHandler: AppRouteHandler<typeof updateSectionRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const { id } = c.req.valid('param');
        const user = c.get('user');

        const rawSection = await SectionService.updateSection(c.get('dbClient'), id, {
            name: body.name,
            departmentId: body.departmentId,
            courseId: body.courseId,
            yearLevel: body.yearLevel,
            updated_by: user.id,
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
                message: 'Section updated successfully',
                data: section,
            },
            200,
        );
    } catch (error: any) {
        console.error('Update section error:', error);
        const code = error?.code ?? error?.cause?.code;
        if (code === 'P2025' || error?.message === 'No result') {
            return c.json({ error: 'Section not found' }, 404);
        }
        if (code === 'P2002' || code === '23505') {
            return c.json({ error: 'Section name already exists' }, 409);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
