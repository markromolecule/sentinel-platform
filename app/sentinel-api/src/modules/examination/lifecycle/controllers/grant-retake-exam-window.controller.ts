import { createRoute } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { requireActivePermission } from '../../../../lib/permissions';
import { type AppRouteHandler } from '../../../../types/hono';
import { EntitlementsRepository } from '../../access/data/entitlements.repository';
import { getReportingExamContext } from '../../reporting/services/get-reporting-exam-context';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';
import { appendExamAttemptLifecycleEvent } from '../services/lifecycle-event.service';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { grantRetakeExamWindowSchema } from '../lifecycle.dto';
import { transitionExamAttemptLifecycle } from '../services/lifecycle-transition.service';

export const grantRetakeExamWindowRoute = createRoute({
    method: 'post',
    path: '/:id/students/:studentId/lifecycle/grant-retake',
    tags: ['Exams'],
    summary: 'Grant a retake exam window for one student',
    request: {
        params: grantRetakeExamWindowSchema.params,
        body: {
            content: {
                'application/json': {
                    schema: grantRetakeExamWindowSchema.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Retake exam window granted successfully',
            content: {
                'application/json': {
                    schema: grantRetakeExamWindowSchema.response,
                },
            },
        },
    },
});

export const grantRetakeExamWindowRouteHandler: AppRouteHandler<
    typeof grantRetakeExamWindowRoute
> = async (c) => {
    requireActivePermission(c, 'examinations:update');

    const { id, studentId } = c.req.valid('param');
    const body = c.req.valid('json');
    const exam = await getReportingExamContext({
        dbClient: c.get('dbClient'),
        examId: id,
        institutionId: c.get('institutionId'),
        viewerRole: 'admin',
        userId: c.get('user')?.id,
    });

    const isEnrolled = await EntitlementsRepository.hasStudentExamEnrollment(c.get('dbClient'), {
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

    const attemptContext = await getLifecycleAttemptContext({
        dbClient: c.get('dbClient'),
        examId: id,
        attemptId: body.sourceAttemptId,
        institutionId: c.get('institutionId'),
    });

    if (!attemptContext || attemptContext.student.id !== studentId) {
        throw new HTTPException(404, {
            message: 'The selected source attempt does not belong to this student and exam.',
        });
    }

    transitionExamAttemptLifecycle({
        currentState: attemptContext.attempt.lifecycleState,
        nextState: attemptContext.attempt.lifecycleState,
        eventType: 'RETAKE_GRANTED',
    });

    const override = await StudentOverridesService.createStudentExamAccessOverride({
        dbClient: c.get('dbClient'),
        examId: id,
        body: {
            studentId,
            overrideType: 'RETAKE',
            availableFrom: body.availableFrom,
            availableUntil: body.availableUntil,
            allowedAttempts: body.allowedAttempts,
            sourceAttemptId: body.sourceAttemptId,
            notes: body.notes ?? null,
        },
        grantedBy: c.get('user')?.id ?? null,
    });

    const latestEvent = await appendExamAttemptLifecycleEvent({
        dbClient: c.get('dbClient'),
        attemptId: body.sourceAttemptId,
        examId: id,
        studentId,
        eventType: 'RETAKE_GRANTED',
        previousState: attemptContext.attempt.lifecycleState,
        nextState: attemptContext.attempt.lifecycleState,
        actorUserId: c.get('user')?.id ?? null,
        reasonCode: 'RETAKE_GRANTED',
        notes: body.notes ?? null,
        relatedOverrideId: override.id,
    });

    return c.json({
        message: 'Retake exam window granted successfully',
        data: {
            override,
            latestEvent,
        },
    });
};
