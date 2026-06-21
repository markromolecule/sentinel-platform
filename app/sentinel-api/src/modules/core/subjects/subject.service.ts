import { type DbClient } from '@sentinel/db';
import { SubjectCrudService } from './services/subject-crud.service';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

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

type PaginationMetadata = {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
};

type PaginatedResult<T> = {
    items: T[];
    pagination: PaginationMetadata;
};

function paginateItems<T>(items: T[], page?: number, limit?: number): T[] | PaginatedResult<T> {
    if (page === undefined || limit === undefined) {
        return items;
    }

    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
        items: paginatedItems,
        pagination: {
            page,
            limit,
            total: items.length,
            hasMore: offset + paginatedItems.length < items.length,
        },
    };
}

export class SubjectService {
    private static buildSubjectLabel(subject: {
        subject_code?: string | null;
        subject_title?: string | null;
    }) {
        if (subject.subject_code && subject.subject_title) {
            return `${subject.subject_code} - ${subject.subject_title}`;
        }

        return subject.subject_title || subject.subject_code || 'Subject';
    }

    static async getSubjects(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        page?: number,
        limit?: number,
    ) {
        const subjects = await SubjectCrudService.getSubjects(dbClient, institutionId, search);

        return paginateItems(subjects, page, limit);
    }

    static async createSubject(dbClient: DbClient, data: CreateSubjectPayload) {
        const createdSubject = await SubjectCrudService.createSubject(dbClient, {
            code: data.code,
            title: data.title,
            created_by: data.created_by,
            institution_id: data.institution_id,
        });

        const subject = await SubjectCrudService.getSubjectById(
            dbClient,
            createdSubject.subject_id,
            data.institution_id ?? undefined,
        );

        if (data.created_by && data.institution_id) {
            await ActivityNotificationService.notifySubjectCreated({
                dbClient,
                actorUserId: data.created_by,
                institutionId: data.institution_id,
                subjectId: subject.subject_id,
                subjectLabel: SubjectService.buildSubjectLabel(subject),
            });
        }

        return subject;
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

        const subject = await SubjectCrudService.getSubjectById(dbClient, id, institutionId);

        if (data.updated_by && institutionId) {
            await ActivityNotificationService.notifySubjectUpdated({
                dbClient,
                actorUserId: data.updated_by,
                institutionId,
                subjectId: subject.subject_id,
                subjectLabel: SubjectService.buildSubjectLabel(subject),
            });
        }

        return subject;
    }

    static async deleteSubject(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        const subject = institutionId
            ? await SubjectCrudService.getSubjectById(dbClient, id, institutionId)
            : null;

        await SubjectCrudService.deleteSubject(dbClient, id, institutionId);

        if (institutionId && actorUserId) {
            await ActivityNotificationService.notifySubjectDeleted({
                dbClient,
                actorUserId,
                institutionId,
                subjectId: id,
                subjectLabel: SubjectService.buildSubjectLabel(subject ?? {}),
            });
        }
    }

    static async deleteSelectedSubjects(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        const result = await SubjectCrudService.deleteSelectedSubjects(
            dbClient,
            ids,
            institutionId,
        );

        if (institutionId && actorUserId && result.deleted_count > 0) {
            await ActivityNotificationService.notifySubjectDeleted({
                dbClient,
                actorUserId,
                institutionId,
                subjectLabel: `${result.deleted_count} subject${result.deleted_count === 1 ? '' : 's'}`,
                bulk: true,
                count: result.deleted_count,
            });
        }

        return result;
    }
}
