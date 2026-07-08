import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { getExamByIdData } from '../exams/data/get-exam-by-id';
import type { UpdateExamConfigurationBody } from './configuration.dto';
export { buildDefaultExamConfiguration } from './services/build-default-exam-configuration.service';
export { getExamConfigurationState } from './services/get-exam-configuration-state.service';
export { hasExamConfigurationChanges } from './services/has-exam-configuration-changes.service';
export { mapExamConfigurationState } from './services/map-exam-configuration-state.service';
export { normalizeExamConfigurationState } from './services/normalize-exam-configuration-state.service';
export { resolveExaminationGlobalSettings } from './services/resolve-examination-global-settings.service';
export { resolveExamSettings } from './services/resolve-exam-settings.service';
export { saveExamConfiguration } from './services/save-exam-configuration.service';
export type { ExamConfigurationPayload } from './services/configuration.types';
import { getExamConfigurationState } from './services/get-exam-configuration-state.service';
import { resolveExaminationGlobalSettings } from './services/resolve-examination-global-settings.service';
import { saveExamConfiguration } from './services/save-exam-configuration.service';
import { assertExamConfigurationMutable } from './services/assert-exam-configuration-mutable.service';

export class ConfigurationService {
    static async getExaminationConfigurationDefaults(dbClient: DbClient) {
        return await resolveExaminationGlobalSettings(dbClient);
    }

    static async getExamConfiguration(
        dbClient: DbClient,
        examId: string,
        institutionId?: string,
        studentUserId?: string,
    ) {
        const exam = await getExamByIdData({
            dbClient,
            id: examId,
            institutionId,
            studentUserId,
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
        canBypassLock = false,
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

        assertExamConfigurationMutable(exam, canBypassLock);

        await saveExamConfiguration({
            dbClient,
            examId,
            payload: body,
        });

        return await getExamConfigurationState(dbClient, examId);
    }
}
