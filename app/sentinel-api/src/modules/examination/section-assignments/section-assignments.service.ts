import { type DbClient } from '@sentinel/db';
import {
    CreateExamSectionAssignmentBody,
    UpdateExamSectionAssignmentBody,
} from '@sentinel/shared/schema';
import { getExamSectionAssignments } from './data/get-exam-section-assignments';
import { createExamSectionAssignment } from './data/create-exam-section-assignment';
import { updateExamSectionAssignment } from './data/update-exam-section-assignment';
import { deleteExamSectionAssignment } from './data/delete-exam-section-assignment';

export class SectionAssignmentsService {
    static async getExamSectionAssignments(args: { dbClient: DbClient; examId: string }) {
        return await getExamSectionAssignments(args);
    }

    static async createExamSectionAssignment(args: {
        dbClient: DbClient;
        examId: string;
        body: CreateExamSectionAssignmentBody;
    }) {
        return await createExamSectionAssignment({
            dbClient: args.dbClient,
            examId: args.examId,
            sectionId: args.body.sectionId,
            roomId: args.body.roomId,
            instructorId: args.body.instructorId,
            scheduledAt: args.body.scheduledAt,
        });
    }

    static async updateExamSectionAssignment(args: {
        dbClient: DbClient;
        id: string;
        examId: string;
        body: UpdateExamSectionAssignmentBody;
    }) {
        return await updateExamSectionAssignment({
            dbClient: args.dbClient,
            id: args.id,
            examId: args.examId,
            roomId: args.body.roomId,
            instructorId: args.body.instructorId,
            scheduledAt: args.body.scheduledAt,
        });
    }

    static async deleteExamSectionAssignment(args: {
        dbClient: DbClient;
        id: string;
        examId: string;
    }) {
        return await deleteExamSectionAssignment(args);
    }
}
