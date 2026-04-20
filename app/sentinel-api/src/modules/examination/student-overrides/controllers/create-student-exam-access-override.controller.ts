import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type AppRouteHandler } from '../../../../types/hono';
import {
    type AssessmentAllowedRole,
    assertAssessmentAccess,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
} from '../../assessment/assessment-access';
import { EntitlementsRepository } from '../../access/data/entitlements.repository';
import { getReportingExamContext } from '../../reporting/services/get-reporting-exam-context';
import { createStudentExamAccessOverrideSchema } from '../student-overrides.dto';
import { StudentOverridesService } from '../student-overrides.service';

export const createStudentExamAccessOverrideRoute = createRoute({
    method: 'post',
    path: '/:id/student-overrides',
    tags: ['Exams'],
    summary: 'Grant a student-specific exam access override',
    request: {
        params: createStudentExamAccessOverrideSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: createStudentExamAccessOverrideSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Student-specific exam access override granted successfully',
            content: {
                'application/json': {
                    schema: createStudentExamAccessOverrideSchema.response,
                },
            },
        },
    },
});

export const createStudentExamAccessOverrideRouteHandler: AppRouteHandler<
    typeof createStudentExamAccessOverrideRoute
> = async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const resolvedRole = await resolveAssessmentActorRole({
        dbClient: c.get('dbClient'),
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);

    const role = resolvedRole as AssessmentAllowedRole;
    const exam = await getReportingExamContext({
        dbClient: c.get('dbClient'),
        examId: id,
        institutionId: resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
        viewerRole: role,
        userId: user?.id,
    });

    const isEnrolled = await EntitlementsRepository.hasStudentExamEnrollment(c.get('dbClient'), {
        studentId: body.studentId,
        classGroupId: exam.classGroupId,
        subjectId: exam.subjectId,
        sectionId: exam.sectionId,
        sectionIds: exam.assignedSectionIds,
    });

    if (!isEnrolled) {
        throw new HTTPException(404, {
            message: 'Student is not assigned to this exam scope.',
        });
    }

    if (body.sourceAttemptId) {
        const sourceAttempt = await c
            .get('dbClient')
            .selectFrom('exam_attempts')
            .select(['attempt_id'])
            .where('attempt_id', '=', body.sourceAttemptId)
            .where('exam_id', '=', id)
            .where('student_id', '=', body.studentId)
            .executeTakeFirst();

        if (!sourceAttempt) {
            throw new HTTPException(404, {
                message: 'The selected source attempt does not belong to this student and exam.',
            });
        }
    }

    const accessOverride = await StudentOverridesService.createStudentExamAccessOverride({
        dbClient: c.get('dbClient'),
        examId: id,
        body,
        grantedBy: user?.id,
    });

    return c.json({
        message: 'Student-specific exam access override granted successfully',
        data: accessOverride,
    });
};
