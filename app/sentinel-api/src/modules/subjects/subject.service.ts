import { type DbClient } from '@sentinel/db';
import { SubjectCrudService } from './services/subject-crud.service';

type SubjectCorePayload = {
    code: string;
    title: string;
};

type CreateSubjectPayload = SubjectCorePayload & {
    created_by?: string;
};

type UpdateSubjectPayload = Partial<SubjectCorePayload> & {
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

        return await SubjectCrudService.getSubjectById(dbClient, createdSubject.subject_id);
    }

    static async updateSubject(dbClient: DbClient, id: string, data: UpdateSubjectPayload) {
        await SubjectCrudService.updateSubject(dbClient, id, {
            code: data.code,
            title: data.title,
            updated_by: data.updated_by,
        });

        return await SubjectCrudService.getSubjectById(dbClient, id);
    }

    static async deleteSubject(dbClient: DbClient, id: string) {
        return await SubjectCrudService.deleteSubject(dbClient, id);
    }
}
