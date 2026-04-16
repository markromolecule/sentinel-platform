import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { getExamByIdData } from '../exams/data/get-exam-by-id';
import type { UpdateExamConfigurationBody } from './configuration.dto';
export { buildDefaultExamConfiguration } from './services/build-default-exam-configuration';
export { getExamConfigurationState } from './services/get-exam-configuration-state';
export { hasExamConfigurationChanges } from './services/has-exam-configuration-changes';
export { mapExamConfigurationState } from './services/map-exam-configuration-state';
export { normalizeExamConfigurationState } from './services/normalize-exam-configuration-state';
export { resolveExamSettings } from './services/resolve-exam-settings';
export { saveExamConfiguration } from './services/save-exam-configuration';
export type { ExamConfigurationPayload } from './services/configuration.types';
import { getExamConfigurationState } from './services/get-exam-configuration-state';
import { saveExamConfiguration } from './services/save-exam-configuration';
import { assertExamConfigurationMutable } from './services/assert-exam-configuration-mutable';

export class ConfigurationService {
    static async getExamConfiguration(dbClient: DbClient, examId: string, institutionId?: string) {
        const exam = await getExamByIdData({
            dbClient,
            id: examId,
            institutionId,
        });

        if (!exam) {
            throw new HTTPException(404, {
                message: 'Exam not found.',
            });
        }

        return await getExamConfigurationState(dbClient, examId);
    }

    static async updateExamConfiguration(
        dbClient: DbClient,
        examId: string,
        body: UpdateExamConfigurationBody,
        institutionId?: string,
    ) {
        const exam = await getExamByIdData({
            dbClient,
            id: examId,
            institutionId,
        });

        if (!exam) {
            throw new HTTPException(404, {
                message: 'Exam not found.',
            });
        }

        assertExamConfigurationMutable(exam);

        await saveExamConfiguration({
            dbClient,
            examId,
            payload: body,
        });

        return await getExamConfigurationState(dbClient, examId);
    }
}
