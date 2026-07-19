import { type DbClient } from '@sentinel/db';
import {
    CreateExamSectionAssignmentBody,
    CreateExamSectionAssignmentBatchBody,
    UpdateExamSectionAssignmentBody,
} from '@sentinel/shared/schema';
import { getExamSectionAssignments } from './data/get-exam-section-assignments';
import { createExamSectionAssignment } from './data/create-exam-section-assignment';
import { createExamSectionAssignmentsBatch } from './data/create-exam-section-assignments-batch';
import { updateExamSectionAssignment } from './data/update-exam-section-assignment';
import { deleteExamSectionAssignment } from './data/delete-exam-section-assignment';
import { syncExamAssignmentSummary } from './data/sync-exam-assignment-summary';
import { LogsService } from '../../general/logs/logs.service';
import { ExamNotificationService } from '../../general/notification/services/exam-notification.service';
import { sql } from 'kysely';

export class SectionAssignmentsService {
    static async getExamSectionAssignments(args: { dbClient: DbClient; examId: string }) {
        return await getExamSectionAssignments(args);
    }

    static async createExamSectionAssignment(args: {
        dbClient: DbClient;
        examId: string;
        body: CreateExamSectionAssignmentBody;
        actorUserId?: string;
        activeInstitutionId?: string;
    }) {
        const assignment = await createExamSectionAssignment({
            dbClient: args.dbClient,
            examId: args.examId,
            sectionId: args.body.sectionId,
            classGroupId: args.body.classGroupId,
            roomId: args.body.roomId,
            instructorId: args.body.instructorId,
            scheduledAt: args.body.scheduledAt,
        });

        await syncExamAssignmentSummary({
            dbClient: args.dbClient,
            examId: args.examId,
        });

        // Notifications & activity logging
        try {
            const exam = await args.dbClient
                .selectFrom('exams')
                .select(['title', 'institution_id as institutionId'])
                .where('exam_id', '=', args.examId)
                .executeTakeFirst();

            const activeInstitutionId = exam?.institutionId || args.activeInstitutionId;

            if (args.actorUserId && activeInstitutionId) {
                // Log the action
                await LogsService.createLog(args.dbClient, {
                    userId: args.actorUserId,
                    action: 'exam.section_assignment_created',
                    resourceType: 'exam_section_assignment',
                    resourceId: assignment.id,
                    activeInstitutionId,
                    details: {
                        examId: args.examId,
                        sectionId: args.body.sectionId,
                        classGroupId: args.body.classGroupId,
                        roomId: args.body.roomId,
                        instructorId: args.body.instructorId,
                    },
                });

                // Notify assigned instructor
                if (args.body.instructorId && args.body.instructorId !== args.actorUserId) {
                    const actorProfile = await args.dbClient
                        .selectFrom('user_profiles')
                        .select([sql<string>`trim(concat(first_name, ' ', last_name))`.as('fullName')])
                        .where('user_id', '=', args.actorUserId)
                        .executeTakeFirst();
                    const assignerName = actorProfile?.fullName || 'An administrator';

                    await ExamNotificationService.notifyExamAssignmentCreated({
                        dbClient: args.dbClient,
                        recipientUserId: args.body.instructorId,
                        actorUserId: args.actorUserId,
                        institutionId: activeInstitutionId,
                        examId: args.examId,
                        examTitle: exam?.title || '',
                        assignerName,
                    });
                }
            }
        } catch (logErr) {
            console.error('Failed to log or notify for single section assignment:', logErr);
        }

        return assignment;
    }

    static async createExamSectionAssignmentsBatch(args: {
        dbClient: DbClient;
        examId: string;
        body: CreateExamSectionAssignmentBatchBody;
        actorUserId?: string;
        activeInstitutionId?: string;
    }) {
        const assignments = await createExamSectionAssignmentsBatch({
            dbClient: args.dbClient,
            examId: args.examId,
            assignments: args.body.assignments,
        });

        await syncExamAssignmentSummary({
            dbClient: args.dbClient,
            examId: args.examId,
        });

        // Notifications & activity logging
        try {
            const exam = await args.dbClient
                .selectFrom('exams')
                .select(['title', 'institution_id as institutionId'])
                .where('exam_id', '=', args.examId)
                .executeTakeFirst();

            const activeInstitutionId = exam?.institutionId || args.activeInstitutionId;

            if (args.actorUserId && activeInstitutionId) {
                let assignerName = 'An administrator';
                const actorProfile = await args.dbClient
                    .selectFrom('user_profiles')
                    .select([sql<string>`trim(concat(first_name, ' ', last_name))`.as('fullName')])
                    .where('user_id', '=', args.actorUserId)
                    .executeTakeFirst();
                if (actorProfile?.fullName) {
                    assignerName = actorProfile.fullName;
                }

                // Log each assignment
                for (const assignment of assignments) {
                    await LogsService.createLog(args.dbClient, {
                        userId: args.actorUserId,
                        action: 'exam.section_assignment_created',
                        resourceType: 'exam_section_assignment',
                        resourceId: assignment.id,
                        activeInstitutionId,
                        details: {
                            examId: args.examId,
                            sectionId: assignment.sectionId,
                            classGroupId: assignment.classGroupId,
                            roomId: assignment.roomId,
                            instructorId: assignment.instructorId,
                        },
                    });
                }

                // Send a single notification per unique instructor
                const uniqueInstructors = new Set<string>();
                for (const assignment of assignments) {
                    if (assignment.instructorId && assignment.instructorId !== args.actorUserId) {
                        uniqueInstructors.add(assignment.instructorId);
                    }
                }

                for (const instructorId of uniqueInstructors) {
                    await ExamNotificationService.notifyExamAssignmentCreated({
                        dbClient: args.dbClient,
                        recipientUserId: instructorId,
                        actorUserId: args.actorUserId,
                        institutionId: activeInstitutionId,
                        examId: args.examId,
                        examTitle: exam?.title || '',
                        assignerName,
                    });
                }
            }
        } catch (logErr) {
            console.error('Failed to log or notify for batch section assignments:', logErr);
        }

        return assignments;
    }

    static async updateExamSectionAssignment(args: {
        dbClient: DbClient;
        id: string;
        examId: string;
        body: UpdateExamSectionAssignmentBody;
    }) {
        const assignment = await updateExamSectionAssignment({
            dbClient: args.dbClient,
            id: args.id,
            examId: args.examId,
            roomId: args.body.roomId,
            instructorId: args.body.instructorId,
            scheduledAt: args.body.scheduledAt,
        });

        await syncExamAssignmentSummary({
            dbClient: args.dbClient,
            examId: args.examId,
        });

        return assignment;
    }

    static async deleteExamSectionAssignment(args: {
        dbClient: DbClient;
        id: string;
        examId: string;
    }) {
        const deletedId = await deleteExamSectionAssignment(args);

        await syncExamAssignmentSummary({
            dbClient: args.dbClient,
            examId: args.examId,
        });

        return deletedId;
    }
}
