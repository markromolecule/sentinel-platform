import { type DbClient } from '@sentinel/db';
import { ExamService } from '../exams/exam.service';
import { QuestionTypeService } from '../../content/question-type/question-type.service';
import type { BuilderWorkspace, SaveBuilderWorkspaceBody } from './builder.dto';
import { incrementQuestionUsageData } from '../../content/question-bank/data/increment-question-usage';
import { checkExposureThreshold } from '../../content/question-bank/services/check-exposure-threshold';
import { LogsService } from '../../general/logs/logs.service';

function buildBuilderWorkspace(exam: BuilderWorkspace['exam']): BuilderWorkspace {
    return {
        exam,
        questionTypes: QuestionTypeService.getQuestionTypes(),
    };
}

export class BuilderService {
    static async getBuilderWorkspace(dbClient: DbClient, examId: string, institutionId?: string) {
        const exam = await ExamService.getExamById(dbClient, examId, institutionId);

        return buildBuilderWorkspace(exam);
    }

    static async saveBuilderWorkspace(
        dbClient: DbClient,
        examId: string,
        body: SaveBuilderWorkspaceBody,
        institutionId: string | undefined,
        userId: string,
        canBypassLock = false,
    ) {
        const exam = await ExamService.updateExam(
            dbClient,
            examId,
            body,
            institutionId,
            userId,
            canBypassLock,
        );

        // Telemetry logging
        try {
            const instId =
                institutionId || (exam as any).institutionId || (exam as any).institution_id;
            if (instId) {
                await LogsService.createLog(dbClient, {
                    userId,
                    action: 'exam.builder_saved',
                    resourceType: 'exam',
                    resourceId: examId,
                    activeInstitutionId: instId,
                    details: { examId },
                });
            }
        } catch (logErr) {
            console.error('Failed to log exam.builder_saved:', logErr);
        }

        return buildBuilderWorkspace(exam);
    }

    static async publishBuilderWorkspace(
        dbClient: DbClient,
        examId: string,
        institutionId: string | undefined,
        userId: string,
    ) {
        const exam = await ExamService.updateExamStatus(
            dbClient,
            examId,
            'published',
            institutionId,
            userId,
        );

        // 2.6 — After publishing, increment usage counts and check exposure thresholds
        // for all question bank questions linked to this exam.
        try {
            const questionBankIds = (exam.questions ?? [])
                .map((q: any) => q.sourceQuestionBankQuestionId)
                .filter((id: string | undefined): id is string => Boolean(id));

            if (questionBankIds.length > 0) {
                await incrementQuestionUsageData({ dbClient, questionIds: questionBankIds });
                await checkExposureThreshold({ dbClient, questionIds: questionBankIds });
            }
        } catch (error) {
            // Non-critical: log but don't fail the publish operation
            console.error('[BuilderService] Failed to update question usage after publish:', error);
        }

        // Telemetry logging
        try {
            const instId =
                institutionId || (exam as any).institutionId || (exam as any).institution_id;
            if (instId) {
                await LogsService.createLog(dbClient, {
                    userId,
                    action: 'exam.builder_published',
                    resourceType: 'exam',
                    resourceId: examId,
                    activeInstitutionId: instId,
                    details: { examId },
                });
            }
        } catch (logErr) {
            console.error('Failed to log exam.builder_published:', logErr);
        }

        return buildBuilderWorkspace(exam);
    }
}
