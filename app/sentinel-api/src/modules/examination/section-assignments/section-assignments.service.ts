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

export class SectionAssignmentsService {
    static async getExamSectionAssignments(args: { dbClient: DbClient; examId: string }) {
        return await getExamSectionAssignments(args);
    }

    static async createExamSectionAssignment(args: {
        dbClient: DbClient;
        examId: string;
        body: CreateExamSectionAssignmentBody;
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

        return assignment;
    }

    static async createExamSectionAssignmentsBatch(args: {
        dbClient: DbClient;
        examId: string;
        body: CreateExamSectionAssignmentBatchBody;
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
