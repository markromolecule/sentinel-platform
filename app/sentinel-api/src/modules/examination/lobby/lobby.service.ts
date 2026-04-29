import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { EntitlementsRepository } from '../access/data/entitlements.repository';
import type { LobbyAdmissionDecisionStatus } from './lobby.dto';
import { checkInLobby } from './services/check-in-lobby';
import { getAdmissionStatus } from './services/get-admission-status';
import { getLobbyCount } from './services/get-lobby-count';
import { getWaitingList } from './services/get-waiting-list';
import { updateAdmissions } from './services/update-admissions';

async function resolveStudentId(dbClient: DbClient, userId: string) {
    const student = await EntitlementsRepository.getStudentProfileByUserId(dbClient, userId);

    if (!student) {
        throw new HTTPException(404, { message: 'Student profile not found' });
    }

    return student.student_id;
}

export class LobbyService {
    static async checkIn(dbClient: DbClient, examId: string, userId: string) {
        const studentId = await resolveStudentId(dbClient, userId);

        return await checkInLobby(dbClient, examId, studentId);
    }

    static async getAdmissionStatus(dbClient: DbClient, examId: string, userId: string) {
        const studentId = await resolveStudentId(dbClient, userId);

        return await getAdmissionStatus(dbClient, examId, studentId);
    }

    static async getLobbyCount(dbClient: DbClient, examId: string) {
        return await getLobbyCount(dbClient, examId);
    }

    static async getWaitingList(dbClient: DbClient, examId: string) {
        return await getWaitingList(dbClient, examId);
    }

    static async updateAdmissions(
        dbClient: DbClient,
        examId: string,
        studentIds: string[],
        status: LobbyAdmissionDecisionStatus,
        instructorId?: string,
    ) {
        return await updateAdmissions(dbClient, examId, studentIds, status, instructorId);
    }
}
