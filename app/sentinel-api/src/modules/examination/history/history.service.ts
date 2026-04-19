import { type DbClient } from '@sentinel/db';
import { getStudentExamHistory } from './services/get-student-exam-history';
import { getStudentExamHistoryDetail } from './services/get-student-exam-history-detail';

export class HistoryService {
    static async getStudentHistory(
        dbClient: DbClient,
        studentUserId: string,
        institutionId?: string,
    ) {
        return await getStudentExamHistory(dbClient, studentUserId, institutionId);
    }

    static async getStudentHistoryDetail(
        dbClient: DbClient,
        attemptId: string,
        studentUserId: string,
        institutionId?: string,
    ) {
        return await getStudentExamHistoryDetail(dbClient, attemptId, studentUserId, institutionId);
    }
}
