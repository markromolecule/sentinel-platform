import { type DbClient } from '@sentinel/db';
import { getExamConfigurationData } from '../../exams/data/get-exam-configuration';
import type { ExamConfigurationState } from '../configuration.dto';
import { mapExamConfigurationState } from './map-exam-configuration-state';
import { resolveExaminationGlobalSettings } from './resolve-examination-global-settings.service';

export async function getExamConfigurationState(
    dbClient: DbClient,
    examId: string,
): Promise<ExamConfigurationState> {
    const [record, globalSettings] = await Promise.all([
        getExamConfigurationData({
            dbClient,
            examId,
        }),
        resolveExaminationGlobalSettings(dbClient),
    ]);

    return mapExamConfigurationState(record, globalSettings);
}
