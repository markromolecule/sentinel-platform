import { createRoute } from '@hono/zod-openapi';
import { type AppRouteHandler } from '../../../types/hono';
import { createStudentSchema } from '../onboarding.dto';
import { OnboardingService } from '../onboarding.service';

export const createStudentRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Onboarding'],
    summary: 'Create Student Profile',
    description: 'Creates a new student profile connecting user to institution and department.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createStudentSchema.body,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: createStudentSchema.response,
                },
            },
            description: 'Student profile created successfully',
        },
        400: { description: 'Bad Request' },
        500: { description: 'Internal Server Error' },
    },
});

export const createStudentRouteHandler: AppRouteHandler<typeof createStudentRoute> = async (c) => {
    try {
        const body = c.req.valid('json');
        const user = c.get('user');

        const student = await OnboardingService.createStudent(user.id, {
            studentNumber: body.studentNumber,
            institutionId: body.institutionId,
            departmentId: body.departmentId,
        });

        // The exact fields mapped matching onboard.dto.ts
        const formattedStudent = {
            student_id: student.student_id,
            student_number: student.student_number,
            institution_id: student.institution_id,
            department_id: student.department_id,
            created_at: new Date().toISOString(),
        };

        return c.json(
            {
                message: 'Student profile created successfully',
                data: formattedStudent,
            },
            201,
        );
    } catch (error: any) {
        console.error('Onboarding create student error:', error);
        return c.json({ error: error.message || 'Internal Server Error' }, 500);
    }
};
