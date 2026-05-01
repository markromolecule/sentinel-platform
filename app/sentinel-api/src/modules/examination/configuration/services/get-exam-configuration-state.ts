import { type DbClient } from '@sentinel/db';
import { getExamConfigurationData } from '../../exams/data/get-exam-configuration';
import type { ExamConfigurationState } from '../configuration.dto';
import { getGlobalExaminationSettingsData } from '../data/get-global-settings';
import { mapExamConfigurationState } from './map-exam-configuration-state';

export async function getExamConfigurationState(
    dbClient: DbClient,
    examId: string,
): Promise<ExamConfigurationState> {
    const [record, globalSettingsRow] = await Promise.all([
        getExamConfigurationData({
            dbClient,
            examId,
        }),
        getGlobalExaminationSettingsData(dbClient),
    ]);

    const settingValue = globalSettingsRow?.setting_value as any;
    const globalSettings = settingValue?.defaultLobbyAdmissionMode ? settingValue : null;

    return mapExamConfigurationState(record, globalSettings);
}
