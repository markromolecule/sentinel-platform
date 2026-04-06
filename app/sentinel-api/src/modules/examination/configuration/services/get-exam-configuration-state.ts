import { type DbClient } from '@sentinel/db';
import { getExamConfigurationData } from '@/modules/examination/exams/data/get-exam-configuration';
import type { ExamConfigurationState } from '../configuration.dto';
import { mapExamConfigurationState } from './map-exam-configuration-state';

export async function getExamConfigurationState(
    dbClient: DbClient,
    examId: string,
): Promise<ExamConfigurationState> {
    const record = await getExamConfigurationData({
        dbClient,
        examId,
    });

    return mapExamConfigurationState(record);
}
