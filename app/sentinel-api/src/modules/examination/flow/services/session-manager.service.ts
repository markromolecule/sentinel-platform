import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import {
    scoreExamAttempt,
    shuffleExamQuestions,
    randomizeQuestionChoices,
    type ExamAttemptAnswers,
} from '@sentinel/shared';
import type { ExamQuestion } from '@sentinel/shared/types';
import { AccessGatekeeperService } from '../../access/services/access-gatekeeper.service';
import { getExamConfigurationState } from '../../configuration/configuration.service';
import type { ExamConfigurationState } from '../../configuration/configuration.dto';
import { SessionRepository } from '../data/session.repository';
import { getExamQuestionsData } from '../../exams/data/get-exam-questions';
import type { CompleteSessionBody, SyncSessionBody } from '../flow.dto';
import { calibrateQuestionDifficulty } from '../../../content/question-bank/services/calibrate-question-difficulty';
import { LogsService } from '../../../general/logs/logs.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export class SessionManagerService {
    /**
     * Attempts to start a session. This dictates the core flow boundary:
     * Consult the access domain before proceeding.
     */
    static async startSession(
        db: DbClient,
        studentId: string,
        examId: string,
    ): Promise<{
        sessionId?: string;
        configSnapshot?: ExamConfigurationState;
        isResumed?: boolean;
        answers?: ExamAttemptAnswers;
        elapsedSeconds?: number;
        reconnectAttemptCount?: number;
        maxReconnectAttempts?: number;
        attemptId?: string;
        error?: string;
        errorCode?: 'ATTEMPT_ALREADY_COMPLETED';
    }> {
        // 1. Cross-Domain Call: Verify access constraints
        const accessCheck = await AccessGatekeeperService.verifyStudentExamEligibility(
            db,
            studentId,
            examId,
        );

        if (!accessCheck.isEligible) {
            return { error: accessCheck.reason || 'Access denied mapping to current exam flow.' };
        }

        const configSnapshot = await getExamConfigurationState(db, examId);

        // 2. Access granted, initialize session data
        const session = await SessionRepository.createSession(db, {
            studentId: accessCheck.context.studentId,
            examId,
            maxReconnectAttempts: configSnapshot.configuration.maxReconnectAttempts,
            accessOverride: accessCheck.accessOverride ?? null,
            updatedBy: studentId,
        });

        if ('errorCode' in session) {
            return {
                attemptId: session.attemptId,
                error: session.error,
                errorCode: session.errorCode,
            };
        }

        // Telemetry logging and notifications
        try {
            await LogsService.createLog(db, {
                userId: studentId,
                action: session.isResumed ? 'exam.session_resumed' : 'exam.session_started',
                resourceType: 'exam_attempt',
                resourceId: session.sessionId,
                activeInstitutionId: accessCheck.context.institutionId ?? '',
                details: {
                    examId,
                    isResumed: session.isResumed,
                },
            });

            if (accessCheck.context.institutionId) {
                const exam = await db
                    .selectFrom('exams')
                    .select(['title'])
                    .where('exam_id', '=', examId)
                    .executeTakeFirst();
                const examTitle = exam?.title || 'Exam';

                await ActivityNotificationService.notifyInstitutionActivityCreated({
                    dbClient: db,
                    actorUserId: studentId,
                    institutionId: accessCheck.context.institutionId,
                    targetType: 'EXAM_ATTEMPT',
                    targetId: session.sessionId,
                    targetLabel: examTitle,
                    title: session.isResumed ? 'Exam attempt resumed' : 'Exam attempt started',
                    message: `Exam attempt ${session.isResumed ? 'resumed' : 'started'} for "${examTitle}".`,
                    sourceModule: 'exams',
                    sourceAction: session.isResumed ? 'resume-attempt' : 'start-attempt',
                    metadata: {
                        examId,
                        isResumed: session.isResumed,
                        attemptId: session.sessionId,
                    },
                });
            }
        } catch (logErr) {
            console.error('Failed to log or notify exam session started/resumed:', logErr);
        }

        return {
            sessionId: session.sessionId,
            configSnapshot,
            isResumed: session.isResumed,
            answers: 'answers' in session ? session.answers : undefined,
            elapsedSeconds: 'elapsedSeconds' in session ? session.elapsedSeconds : undefined,
            reconnectAttemptCount:
                'reconnectAttemptCount' in session ? session.reconnectAttemptCount : undefined,
            maxReconnectAttempts:
                'maxReconnectAttempts' in session ? session.maxReconnectAttempts : undefined,
        };
    }

    static async syncSession(db: DbClient, studentUserId: string, body: SyncSessionBody) {
        const attempt = await SessionRepository.getOwnedSessionAttempt(db, {
            sessionId: body.sessionId,
            studentUserId,
        });

        if (!attempt?.attempt_id) {
            throw new HTTPException(404, {
                message: 'Exam session not found for the authenticated student.',
            });
        }

        if (attempt.completed_at || attempt.status === 'COMPLETED') {
            throw new HTTPException(409, {
                message: 'This exam session has already been submitted and cannot be synced.',
            });
        }

        await SessionRepository.updateSyncProgress(db, {
            sessionId: body.sessionId,
            answeredCount: body.answeredCount,
            timeSpentMinutes: body.elapsedSeconds > 0 ? Math.ceil(body.elapsedSeconds / 60) : 0,
            answers: body.answers as ExamAttemptAnswers | undefined,
        });

        // Telemetry logging
        if (attempt.institution_id) {
            try {
                await LogsService.createLog(db, {
                    userId: studentUserId,
                    action: 'exam.heartbeat_synced',
                    resourceType: 'exam_attempt',
                    resourceId: attempt.attempt_id,
                    activeInstitutionId: attempt.institution_id,
                    details: {
                        sessionId: body.sessionId,
                        answeredCount: body.answeredCount,
                        timeSpentMinutes:
                            body.elapsedSeconds > 0 ? Math.ceil(body.elapsedSeconds / 60) : 0,
                    },
                });
            } catch (logErr) {
                console.error('Failed to log exam.heartbeat_synced:', logErr);
            }
        }
    }

    static async completeSession(db: DbClient, studentUserId: string, body: CompleteSessionBody) {
        const attempt = await SessionRepository.getOwnedSessionAttempt(db, {
            sessionId: body.sessionId,
            studentUserId,
        });

        if (!attempt?.exam_id) {
            throw new HTTPException(404, {
                message: 'Exam session not found for the authenticated student.',
            });
        }

        if (attempt.completed_at || attempt.status === 'COMPLETED') {
            throw new HTTPException(409, {
                message: 'This exam session has already been submitted.',
            });
        }

        if (attempt.status !== 'IN_PROGRESS') {
            throw new HTTPException(409, {
                message: 'This exam session is not active anymore.',
            });
        }

        const [questions, configSnapshot] = await Promise.all([
            getExamQuestionsData({
                dbClient: db,
                examId: attempt.exam_id,
            }),
            getExamConfigurationState(db, attempt.exam_id),
        ]);

        const mappedQuestions: ExamQuestion[] = questions.map((question) => ({
            id: question.question_id,
            examId: question.exam_id,
            sectionId: question.exam_section_id ?? undefined,
            sourceQuestionBankQuestionId: question.source_question_bank_question_id ?? undefined,
            sourceCollectionId: question.source_collection_id ?? undefined,
            sourceOrigin: question.source_origin === 'AI_PDF' ? 'AI_PDF' : undefined,
            sourceFileName: question.source_file_name ?? null,
            sourcePageNumber: question.source_page_number ?? null,
            sourceEvidence: question.source_evidence ?? null,
            passageContent: question.passage_content ?? null,
            passageType: question.passage_type === 'html' ? 'html' : 'plain',
            type: question.question_type as ExamQuestion['type'],
            points: question.points,
            orderIndex: question.order_index,
            content: question.content as ExamQuestion['content'],
            tags: [],
        }));

        let finalQuestions = mappedQuestions;
        const seed = attempt.attempt_id || `${studentUserId}-${attempt.exam_id}`;

        if (configSnapshot.settings.shuffleQuestions) {
            finalQuestions = shuffleExamQuestions(finalQuestions, seed);
        }

        if (configSnapshot.settings.randomizeChoices) {
            finalQuestions = finalQuestions.map((q) =>
                randomizeQuestionChoices(q, `${seed}-${q.id}`),
            );
        }

        const summary = scoreExamAttempt({
            questions: finalQuestions,
            answers: body.answers as ExamAttemptAnswers,
        });

        const completedAttempt = await SessionRepository.completeSession(db, {
            sessionId: body.sessionId,
            score: summary.score,
            totalScore: summary.totalScore,
            timeSpentMinutes: body.elapsedSeconds > 0 ? Math.ceil(body.elapsedSeconds / 60) : 0,
            answeredCount: summary.answeredCount,
            answers: body.answers as ExamAttemptAnswers,
        });

        if (!completedAttempt?.completed_at) {
            throw new Error('Failed to finalize the exam session.');
        }

        // Telemetry logging and notifications
        if (attempt.institution_id) {
            try {
                await LogsService.createLog(db, {
                    userId: studentUserId,
                    action: 'exam.session_completed',
                    resourceType: 'exam_attempt',
                    resourceId: completedAttempt.attempt_id,
                    activeInstitutionId: attempt.institution_id,
                    details: {
                        sessionId: body.sessionId,
                        score: summary.score,
                        totalScore: summary.totalScore,
                        timeSpentMinutes:
                            body.elapsedSeconds > 0 ? Math.ceil(body.elapsedSeconds / 60) : 0,
                    },
                });

                const exam = await db
                    .selectFrom('exams')
                    .select(['title'])
                    .where('exam_id', '=', attempt.exam_id)
                    .executeTakeFirst();
                const examTitle = exam?.title || 'Exam';

                await ActivityNotificationService.notifyInstitutionActivityTransaction({
                    dbClient: db,
                    actorUserId: studentUserId,
                    institutionId: attempt.institution_id,
                    targetType: 'EXAM_ATTEMPT',
                    targetId: completedAttempt.attempt_id,
                    targetLabel: examTitle,
                    title: 'Exam attempt submitted',
                    message: `Exam attempt submitted for "${examTitle}". Score: ${summary.score}/${summary.totalScore}.`,
                    sourceModule: 'exams',
                    sourceAction: 'complete-attempt',
                    metadata: {
                        examId: attempt.exam_id,
                        attemptId: completedAttempt.attempt_id,
                        score: summary.score,
                        totalScore: summary.totalScore,
                    },
                });
            } catch (logErr) {
                console.error('Failed to log or notify exam.session_completed:', logErr);
            }
        }

        // Post-completion IRT calibration (non-critical, fire-and-forget)
        // Identify all question bank question IDs in this exam and calibrate.
        try {
            const questionBankIds = mappedQuestions
                .map((q) => q.sourceQuestionBankQuestionId)
                .filter((id): id is string => Boolean(id));

            if (questionBankIds.length > 0) {
                void calibrateQuestionDifficulty({
                    dbClient: db,
                    questionBankQuestionIds: questionBankIds,
                });
            }
        } catch (calibrationError) {
            console.error('[SessionManagerService] IRT calibration failed:', calibrationError);
        }

        const completedAt =
            completedAttempt.completed_at instanceof Date
                ? completedAttempt.completed_at.toISOString()
                : new Date(completedAttempt.completed_at).toISOString();

        return {
            attemptId: completedAttempt.attempt_id,
            completedAt,
            ...summary,
        };
    }
}
