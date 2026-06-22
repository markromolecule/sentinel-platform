import { type DbClient } from '@sentinel/db';
import { ExamService } from '../../exams/exam.service';
import { LogsService } from '../../../general/logs/logs.service';
import type { SaveBuilderWorkspaceBody } from '../builder.dto';
import { buildBuilderWorkspace } from './build-builder-workspace.service';

export type SaveBuilderWorkspaceServiceArgs = {
    dbClient: DbClient;
    examId: string;
    body: SaveBuilderWorkspaceBody;
    institutionId: string | undefined;
    userId: string;
    canBypassLock?: boolean;
};

/**
 * Saves/updates the current builder workspace state for an exam, logging telemetry.
 */
export async function saveBuilderWorkspaceService({
    dbClient,
    examId,
    body,
    institutionId,
    userId,
    canBypassLock = false,
}: SaveBuilderWorkspaceServiceArgs) {
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
        const instId = institutionId || (exam as any).institutionId || (exam as any).institution_id;
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
