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
import { overrideReconnectLimitSchema } from '../student-overrides.dto';
import { StudentOverridesService } from '../student-overrides.service';

export const overrideReconnectLimitRoute = createRoute({
    method: 'post',
    path: '/:id/student-overrides/reconnect-override/:studentId',
    tags: ['Exams'],
    summary: 'Grant a one-time reconnect limit override',
    request: {
        params: overrideReconnectLimitSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: overrideReconnectLimitSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Reconnect override granted successfully',
            content: {
                'application/json': {
                    schema: overrideReconnectLimitSchema.response,
                },
            },
        },
    },
});

export const overrideReconnectLimitRouteHandler: AppRouteHandler<
    typeof overrideReconnectLimitRoute
> = async (c) => {
    const { id, studentId } = c.req.valid('param');
    const body = c.req.valid('json');
    const supabaseUser = c.get('supabaseUser') as any;
    const user = c.get('user');
    const dbClient = c.get('dbClient');
    const resolvedRole = await resolveAssessmentActorRole({
        dbClient,
        userId: user?.id,
        claimedRole: supabaseUser?.user_metadata?.role,
    });

    assertAssessmentAccess(resolvedRole);

    const role = resolvedRole as AssessmentAllowedRole;
    const exam = await getReportingExamContext({
        dbClient,
        examId: id,
        institutionId: resolveAssessmentInstitutionId({
            role,
            contextInstitutionId: c.get('institutionId'),
        }),
        viewerRole: role,
        userId: user?.id,
    });

    const isEnrolled = await EntitlementsRepository.hasStudentExamEnrollment(dbClient, {
        studentId,
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

    try {
        const accessOverride = await StudentOverridesService.createReconnectLimitOverride({
            dbClient,
            examId: id,
            studentId,
            reason: body.reason,
            grantedBy: user?.id,
        });

        return c.json({
            message: 'Reconnect override granted successfully',
            data: accessOverride,
        });
    } catch (error) {
        throw new HTTPException(400, {
            message: error instanceof Error ? error.message : 'Failed to grant reconnect override.',
        });
    }
};
