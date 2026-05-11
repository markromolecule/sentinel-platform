import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { AssessmentAllowedRole } from '../assessment/assessment-access';
import { EntitlementsRepository } from '../access/data/entitlements.repository';
import { assertInstructorExamAccess } from '../assign/services/exam-access';
import { getMonitoringExamContext } from '../monitoring/services/get-monitoring-exam-context';
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

async function assertLobbyExamAccess(args: {
    dbClient: DbClient;
    examId: string;
    userId: string;
    institutionId?: string;
    role: AssessmentAllowedRole;
}) {
    const { dbClient, examId, userId, institutionId, role } = args;

    await getMonitoringExamContext({
        dbClient,
        examId,
        institutionId,
        viewerRole: role,
        userId,
    });
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

    static async getLobbyCount(
        dbClient: DbClient,
        examId: string,
        userId?: string,
        institutionId?: string,
        role?: string | null,
    ) {
        if (userId && role !== 'student') {
            await assertInstructorExamAccess({
                dbClient,
                examId,
                userId,
                institutionId,
            });
        }

        return await getLobbyCount(dbClient, examId);
    }

    static async getWaitingList(
        dbClient: DbClient,
        examId: string,
        userId: string,
        role: AssessmentAllowedRole,
        institutionId?: string,
    ) {
        await assertLobbyExamAccess({
            dbClient,
            examId,
            userId,
            institutionId,
            role,
        });

        return await getWaitingList(dbClient, examId);
    }

    static async updateAdmissions(
        dbClient: DbClient,
        examId: string,
        studentIds: string[],
        status: LobbyAdmissionDecisionStatus,
        instructorId: string,
        role: AssessmentAllowedRole,
        institutionId?: string,
    ) {
        await assertLobbyExamAccess({
            dbClient,
            examId,
            userId: instructorId,
            institutionId,
            role,
        });

        return await updateAdmissions(dbClient, examId, studentIds, status, instructorId);
    }
}
