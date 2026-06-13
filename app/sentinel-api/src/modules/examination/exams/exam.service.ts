import { type DbClient } from '@sentinel/db';
import type { CreateExamBody, GetExamsQuery, UpdateExamBody } from './exam.dto';
import { createExam as createExamService } from './services/create-exam';
import { deleteExam as deleteExamService } from './services/delete-exam';
import { getExamDetail } from './services/get-exam-detail';
import { getExams as getExamsService } from './services/get-exams';
import { updateExam as updateExamService } from './services/update-exam';
import { updateExamStatus as updateExamStatusService } from './services/update-exam-status';

export class ExamService {
    static async getExams(
        dbClient: DbClient,
        filters: GetExamsQuery,
        institutionId?: string,
        studentUserId?: string,
        departmentId?: string,
    ) {
        return await getExamsService(dbClient, filters, institutionId, studentUserId, departmentId);
    }

    static async getExamById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        studentUserId?: string,
    ) {
        return await getExamDetail(dbClient, id, institutionId, studentUserId);
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
