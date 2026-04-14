import { type DbClient } from '@sentinel/db';
import { SessionRepository } from '../data/session.repository';
import { AccessGatekeeperService } from '../../access/services/access-gatekeeper.service';
import { getExamConfigurationState } from '../../configuration/configuration.service';
import type { ExamConfigurationState } from '../../configuration/configuration.dto';

export class SessionManagerService {
    /**
     * Attempts to start a session. This dictates the core flow boundary:
     * We MUST consult the access domain before proceeding.
     */
    static async startSession(
        db: DbClient,
        studentId: string,
        examId: string,
    ): Promise<{
        sessionId?: string;
        configSnapshot?: ExamConfigurationState;
        isResumed?: boolean;
        error?: string;
    }> {
        // 1. Cross-Domain Call: Verify access constraints
        const accessCheck = await AccessGatekeeperService.verifyStudentExamEligibility(
            db,
            studentId,
            examId,
        );

        if (!accessCheck.isEligible) {
            return { error: accessCheck.reason || 'Access denied mapping to current exam flow.' };
        }

        const configSnapshot = await getExamConfigurationState(db, examId);

        // 2. Access granted, initialize session data
        const session = await SessionRepository.createSession(db, {
            studentId: accessCheck.context.studentId,
            examId,
            maxReconnectAttempts: configSnapshot.configuration.maxReconnectAttempts,
        });

        return {
            sessionId: session.sessionId,
            configSnapshot,
            isResumed: session.isResumed,
        };
    }
}
