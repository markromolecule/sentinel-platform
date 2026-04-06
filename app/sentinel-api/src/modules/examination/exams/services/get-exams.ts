import { type DbClient } from '@sentinel/db';
import type { GetExamsQuery } from '../exam.dto';
import { getExamsData } from '../data/get-exams';
import { mapExamSummaryResponse } from './map-exam-response';

export async function getExams(
    dbClient: DbClient,
    filters: GetExamsQuery,
    institutionId?: string,
) {
    const records = await getExamsData({
        dbClient,
        institutionId,
        filters,
    });

    return records.map(mapExamSummaryResponse);
}
