import { type DbClient } from '@sentinel/db';
import { ExamService } from '../../exams/exam.service';
import { incrementQuestionUsageData } from '../../../content/question-bank/data/increment-question-usage';
import { checkExposureThreshold } from '../../../content/question-bank/services/check-exposure-threshold.service';
import { LogsService } from '../../../general/logs/logs.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { buildBuilderWorkspace } from './build-builder-workspace.service';

export type PublishBuilderWorkspaceServiceArgs = {
    dbClient: DbClient;
    examId: string;
    institutionId: string | undefined;
    userId: string;
};

/**
 * Publishes the builder workspace, updates question usage stats/exposure thresholds,
 * logs activity, and sends notifications.
 */
export async function publishBuilderWorkspaceService({
    dbClient,
    examId,
    institutionId,
    userId,
}: PublishBuilderWorkspaceServiceArgs) {
    const exam = await ExamService.updateExamStatus(
        dbClient,
        examId,
        'published',
        institutionId,
        userId,
    );

    // After publishing, increment usage counts and check exposure thresholds
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

    // Telemetry logging and notifications
    try {
        const instId = institutionId || (exam as any).institutionId || (exam as any).institution_id;
        if (instId) {
            await LogsService.createLog(dbClient, {
                userId,
                action: 'exam.builder_published',
                resourceType: 'exam',
                resourceId: examId,
                activeInstitutionId: instId,
                details: { examId },
            });

            await ActivityNotificationService.notifyInstitutionActivityCreated({
                dbClient,
                actorUserId: userId,
                institutionId: instId,
                targetType: 'EXAM',
                targetId: examId,
                targetLabel: exam.title || 'Exam',
                title: 'Exam published',
                message: `Exam "${exam.title || 'Exam'}" has been published.`,
                sourceModule: 'exams',
                sourceAction: 'publish',
                metadata: {
                    examId,
                },
            });
        }
    } catch (logErr) {
        console.error('Failed to log or notify exam.builder_published:', logErr);
    }

    return buildBuilderWorkspace(exam);
}
