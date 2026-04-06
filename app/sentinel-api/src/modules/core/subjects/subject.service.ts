import { type DbClient } from '@sentinel/db';
import { SubjectCrudService } from './services/subject-crud.service';

type SubjectCorePayload = {
    code: string;
    title: string;
};

type CreateSubjectPayload = SubjectCorePayload & {
    created_by?: string;
    institution_id?: string | null;
};

type UpdateSubjectPayload = Partial<SubjectCorePayload> & {
    updated_by?: string;
};

export class SubjectService {
    static async getSubjects(dbClient: DbClient, institutionId?: string, search?: string) {
        return await SubjectCrudService.getSubjects(dbClient, institutionId, search);
    }

    static async createSubject(dbClient: DbClient, data: CreateSubjectPayload) {
        const createdSubject = await SubjectCrudService.createSubject(dbClient, {
            code: data.code,
            title: data.title,
            created_by: data.created_by,
            institution_id: data.institution_id,
        });

        return await SubjectCrudService.getSubjectById(
            dbClient,
            createdSubject.subject_id,
            data.institution_id ?? undefined,
        );
    }

    static async updateSubject(
        dbClient: DbClient,
        id: string,
        data: UpdateSubjectPayload,
        institutionId?: string,
    ) {
        await SubjectCrudService.updateSubject(
            dbClient,
            id,
            {
                code: data.code,
                title: data.title,
                updated_by: data.updated_by,
            },
            institutionId,
        );

        return await SubjectCrudService.getSubjectById(dbClient, id, institutionId);
    }

    static async deleteSubject(dbClient: DbClient, id: string, institutionId?: string) {
        return await SubjectCrudService.deleteSubject(dbClient, id, institutionId);
    }

    static async deleteSelectedSubjects(dbClient: DbClient, ids: string[], institutionId?: string) {
        return await SubjectCrudService.deleteSelectedSubjects(dbClient, ids, institutionId);
    }
}
