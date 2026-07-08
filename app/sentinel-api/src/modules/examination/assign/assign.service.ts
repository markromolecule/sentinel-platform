import { type DbClient } from '@sentinel/db';
import type { CreateExamAssignmentBody } from './assign.dto';
import { createExamAssignment } from './services/create-exam-assignment.service';
import { getExamAssignments } from './services/get-exam-assignments.service';
import { respondToExamAssignment } from './services/respond-to-exam-assignment.service';

export class AssignService {
    static async createExamAssignment(args: {
        dbClient: DbClient;
        body: CreateExamAssignmentBody;
        institutionId?: string;
        userId: string;
    }) {
        return await createExamAssignment(args);
    }

    static async getExamAssignments(args: {
        dbClient: DbClient;
        userId: string;
        institutionId?: string;
    }) {
        return await getExamAssignments(args);
    }

    static async respondToExamAssignment(args: {
        dbClient: DbClient;
        assignmentId: string;
        institutionId?: string;
        userId: string;
        status: 'ACCEPTED' | 'DECLINED';
    }) {
        return await respondToExamAssignment(args);
    }
}
