import { type DbClient } from '@sentinel/db';
import type { CreateExamBody, GetExamsQuery, UpdateExamBody } from './exam.dto';
import { createExam as createExamService } from './services/create-exam';
import { deleteExam as deleteExamService } from './services/delete-exam';
import { getExamDetail } from './services/get-exam-detail';
import { getExams as getExamsService } from './services/get-exams';
import { getStudentExamHistory } from './services/get-student-exam-history';
import { getStudentExamHistoryDetail } from './services/get-student-exam-history-detail';
import { updateExam as updateExamService } from './services/update-exam';
import { updateExamStatus as updateExamStatusService } from './services/update-exam-status';

export class ExamService {
    static async getExams(
        dbClient: DbClient,
        filters: GetExamsQuery,
        institutionId?: string,
        studentUserId?: string,
    ) {
        return await getExamsService(dbClient, filters, institutionId, studentUserId);
    }

    static async getExamById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        studentUserId?: string,
    ) {
        return await getExamDetail(dbClient, id, institutionId, studentUserId);
    }

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

    static async createExam(
        dbClient: DbClient,
        body: CreateExamBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        return await createExamService(dbClient, body, institutionId, userId);
    }

    static async updateExam(
        dbClient: DbClient,
        id: string,
        body: UpdateExamBody,
        institutionId: string | undefined,
        userId: string,
        canBypassLock = false,
    ) {
        return await updateExamService(dbClient, id, body, institutionId, userId, canBypassLock);
    }

    static async updateExamStatus(
        dbClient: DbClient,
        id: string,
        status: string,
        institutionId: string | undefined,
        userId: string,
    ) {
        return await updateExamStatusService(dbClient, id, status, institutionId, userId);
    }

    static async deleteExam(dbClient: DbClient, id: string, institutionId?: string) {
        await deleteExamService(dbClient, id, institutionId);
    }
}
