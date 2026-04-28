import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { scoreExamAttempt, type ExamAttemptAnswers } from '@sentinel/shared';
import type { ExamQuestion } from '@sentinel/shared/types';
import { AccessGatekeeperService } from '../../access/services/access-gatekeeper.service';
import { getExamConfigurationState } from '../../configuration/configuration.service';
import type { ExamConfigurationState } from '../../configuration/configuration.dto';
import { SessionRepository } from '../data/session.repository';
import { getExamQuestionsData } from '../../exams/data/get-exam-questions';
import type { CompleteSessionBody, SyncSessionBody } from '../flow.dto';
import { calibrateQuestionDifficulty } from '../../../content/question-bank/services/calibrate-question-difficulty';

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

        const questions = await getExamQuestionsData({
            dbClient: db,
            examId: attempt.exam_id,
        });
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
            type: question.question_type as ExamQuestion['type'],
            points: question.points,
            orderIndex: question.order_index,
            content: question.content as ExamQuestion['content'],
            tags: [],
        }));

        const summary = scoreExamAttempt({
            questions: mappedQuestions,
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
