import { type DbClient } from '@sentinel/db';
import type { ExamAccessEligibility } from '../access.dto';
import { EntitlementsRepository } from '../data/entitlements.repository';
import { LogsService } from '../../../general/logs/logs.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { evaluateStudentExamEligibilityService } from './evaluate-student-exam-eligibility.service';

export type VerifyStudentExamEligibilityArgs = {
    dbClient: DbClient;
    userId: string;
    examId: string;
    now?: Date;
};

/**
 * Orchestrates student exam eligibility checking.
 * Invokes the evaluation engine, logs success/failure telemetry,
 * and publishes notifications for eligibility failures.
 */
export async function verifyStudentExamEligibilityService({
    dbClient,
    userId,
    examId,
    now = new Date(),
}: VerifyStudentExamEligibilityArgs): Promise<ExamAccessEligibility> {
    const eligibility = await evaluateStudentExamEligibilityService({
        dbClient,
        userId,
        examId,
        now,
    });

    try {
        const instId = eligibility.isEligible ? eligibility.context.institutionId : undefined;
        if (instId) {
            await LogsService.createLog(dbClient, {
                userId,
                action: eligibility.isEligible
                    ? 'exam.eligibility_passed'
                    : 'exam.eligibility_failed',
                resourceType: 'exam',
                resourceId: examId,
                activeInstitutionId: instId,
                details: {
                    isEligible: eligibility.isEligible,
                    reason: eligibility.isEligible ? undefined : eligibility.reason,
                    reasonCode: eligibility.isEligible ? undefined : eligibility.reasonCode,
                },
            });
        } else {
            const [student, exam] = await Promise.all([
                EntitlementsRepository.getStudentProfileByUserId(dbClient, userId),
                EntitlementsRepository.getExamAccessPolicy(dbClient, examId),
            ]);
            const activeInstitutionId = exam?.institution_id ?? student?.institution_id;
            if (activeInstitutionId) {
                await LogsService.createLog(dbClient, {
                    userId,
                    action: eligibility.isEligible
                        ? 'exam.eligibility_passed'
                        : 'exam.eligibility_failed',
                    resourceType: 'exam',
                    resourceId: examId,
                    activeInstitutionId,
                    details: {
                        isEligible: eligibility.isEligible,
                        reason: eligibility.isEligible ? undefined : eligibility.reason,
                        reasonCode: eligibility.isEligible ? undefined : eligibility.reasonCode,
                    },
                });
            }
        }

        if (!eligibility.isEligible) {
            const [student, exam] = await Promise.all([
                EntitlementsRepository.getStudentProfileByUserId(dbClient, userId),
                EntitlementsRepository.getExamAccessPolicy(dbClient, examId),
            ]);
            const activeInstitutionId = exam?.institution_id ?? student?.institution_id;
            if (activeInstitutionId) {
                await ActivityNotificationService.notifyInstitutionActivityUpdated({
                    dbClient,
                    actorUserId: userId,
                    institutionId: activeInstitutionId,
                    targetType: 'EXAM_ACCESS',
                    targetId: examId,
                    targetLabel: exam?.title || 'Exam',
                    title: 'Exam eligibility failed',
                    message: `Student eligibility verification failed for "${exam?.title || 'Exam'}". Reason: ${eligibility.reason}`,
                    sourceModule: 'exams',
                    sourceAction: 'verify-eligibility',
                    metadata: {
                        reasonCode: eligibility.reasonCode,
                        reason: eligibility.reason,
                    },
                });
            }
        }
    } catch (logErr) {
        console.error('Failed to log exam eligibility telemetry:', logErr);
    }

    return eligibility;
}
