import { type DbClient } from '@sentinel/db';
import type { GetExamsQuery } from '../exam.dto';
import { getExamsData } from '../data/get-exams';
import { mapExamSummaryResponse } from './map-exam-response';

export async function getExams(
    dbClient: DbClient,
    filters: GetExamsQuery,
    institutionId?: string,
    studentUserId?: string,
) {
    const records = await getExamsData({
        dbClient,
        institutionId,
        filters,
        studentUserId,
    });

    const exams = records.map((record) =>
        mapExamSummaryResponse(record, {
            studentView: Boolean(studentUserId),
        }),
    );

    const visibleExams = studentUserId
        ? exams.filter((exam) => exam.status === 'upcoming' || exam.status === 'available')
        : exams;

    if (filters.status) {
        return visibleExams.filter((exam) => exam.status === filters.status);
    }

    return visibleExams;
}
