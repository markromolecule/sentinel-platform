import { type DbClient } from '@sentinel/db';
import { ExamService } from '../../exams/exam.service';
import { buildBuilderWorkspace } from './build-builder-workspace.service';

export type GetBuilderWorkspaceServiceArgs = {
    dbClient: DbClient;
    examId: string;
    institutionId?: string;
};

/**
 * Retrieves the builder workspace configuration for a specific exam.
 */
export async function getBuilderWorkspaceService({
    dbClient,
    examId,
    institutionId,
}: GetBuilderWorkspaceServiceArgs) {
    const exam = await ExamService.getExamById(dbClient, examId, institutionId);

    return buildBuilderWorkspace(exam);
}
