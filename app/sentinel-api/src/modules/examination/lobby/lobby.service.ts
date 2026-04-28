import { type DbClient } from '@sentinel/db';
import type { LobbyAdmissionDecisionStatus } from './lobby.dto';
import { checkInLobby } from './services/check-in-lobby';
import { getAdmissionStatus } from './services/get-admission-status';
import { getWaitingList } from './services/get-waiting-list';
import { updateAdmissions } from './services/update-admissions';

export class LobbyService {
    static async checkIn(dbClient: DbClient, examId: string, studentId: string) {
        return await checkInLobby(dbClient, examId, studentId);
    }

    static async getAdmissionStatus(dbClient: DbClient, examId: string, studentId: string) {
        return await getAdmissionStatus(dbClient, examId, studentId);
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
