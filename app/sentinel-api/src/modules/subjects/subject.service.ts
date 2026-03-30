import { type DbClient } from '@sentinel/db';
import { SubjectAssignmentsService, type SubjectAssignmentsPayload } from './services/subject-assignments.service';
import { SubjectCrudService } from './services/subject-crud.service';

type SubjectCorePayload = {
    code: string;
    title: string;
};

type CreateSubjectPayload = SubjectCorePayload &
    SubjectAssignmentsPayload & {
        created_by?: string;
    };

type UpdateSubjectPayload = Partial<SubjectCorePayload & SubjectAssignmentsPayload> & {
    updated_by?: string;
};

export class SubjectService {
    static async getSubjects(dbClient: DbClient, search?: string) {
        return await SubjectCrudService.getSubjects(dbClient, search);
    }

    static async createSubject(dbClient: DbClient, data: CreateSubjectPayload) {
        const createdSubject = await SubjectCrudService.createSubject(dbClient, {
            code: data.code,
            title: data.title,
            created_by: data.created_by,
        });

        try {
            await SubjectAssignmentsService.updateAll(dbClient, createdSubject.subject_id, data);
            return await SubjectCrudService.getSubjectById(dbClient, createdSubject.subject_id);
        } catch (error) {
            // Best-effort cleanup since prisma-extension-kysely does not support Kysely transactions.
            await SubjectCrudService.deleteSubject(dbClient, createdSubject.subject_id);
            throw error;
        }
    }

    static async updateSubject(dbClient: DbClient, id: string, data: UpdateSubjectPayload) {
        await SubjectCrudService.updateSubject(dbClient, id, {
            code: data.code,
            title: data.title,
            updated_by: data.updated_by,
        });

        await SubjectAssignmentsService.updatePartial(dbClient, id, data);
        return await SubjectCrudService.getSubjectById(dbClient, id);
    }

    static async deleteSubject(dbClient: DbClient, id: string) {
        return await SubjectCrudService.deleteSubject(dbClient, id);
    }
}
