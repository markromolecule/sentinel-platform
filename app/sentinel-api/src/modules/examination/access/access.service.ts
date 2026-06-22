import { type DbClient } from '@sentinel/db';
import type { ExamAccessEligibility } from './access.dto';
import { verifyStudentExamEligibilityService } from './services/verify-student-exam-eligibility.service';

/**
 * Main entrypoint service for Examination Access domain.
 */
export class AccessService {
    /**
     * Verifies if a student is completely eligible to enter the exam flow right now.
     * Evaluates enrollment, active status, time-window logic, and room assignments.
     */
    static async verifyExamEligibility(
        dbClient: DbClient,
        userId: string,
        examId: string,
        now?: Date,
    ): Promise<ExamAccessEligibility> {
        return verifyStudentExamEligibilityService({
            dbClient,
            userId,
            examId,
            now,
        });
    }
}

/**
 * Gatekeeper service class for backward compatibility.
 * @deprecated Use AccessService or verifyStudentExamEligibilityService directly.
 */
export class AccessGatekeeperService {
    /**
     * Verifies if a student is completely eligible to enter the exam flow right now.
     * @deprecated Use AccessService.verifyExamEligibility directly.
     */
    static async verifyStudentExamEligibility(
        dbClient: DbClient,
        userId: string,
        examId: string,
        now?: Date,
    ): Promise<ExamAccessEligibility> {
        return verifyStudentExamEligibilityService({
            dbClient,
            userId,
            examId,
            now,
        });
    }
}
