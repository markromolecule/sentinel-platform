import { type DbClient } from '@sentinel/db';
import { SubjectCrudService } from './subject-crud.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

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

/**
 * Service to handle write operations (create, update, delete) for subjects.
 */
export class ManageSubjectsService {
    /**
     * Builds a label string from subject code and title.
     */
    private static buildSubjectLabel(subject: {
        subject_code?: string | null;
        subject_title?: string | null;
    }) {
        if (subject.subject_code && subject.subject_title) {
            return `${subject.subject_code} - ${subject.subject_title}`;
        }

        return subject.subject_title || subject.subject_code || 'Subject';
    }

    /**
     * Creates a new subject and dispatches activity notifications.
     *
     * @param dbClient - The database client instance.
     * @param data - The payload containing code, title, created_by, and institution_id.
     * @returns The created subject record.
     */
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
                subjectLabel: ManageSubjectsService.buildSubjectLabel(subject),
            });
        }

        return subject;
    }

    /**
     * Updates an existing subject and dispatches activity notifications.
     *
     * @param dbClient - The database client instance.
     * @param id - The ID of the subject to update.
     * @param data - The payload containing partial fields and updated_by.
     * @param institutionId - The institution ID context.
     * @returns The updated subject record.
     */
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
                subjectLabel: ManageSubjectsService.buildSubjectLabel(subject),
            });
        }

        return subject;
    }

    /**
     * Deletes a subject by ID and dispatches activity notifications.
     *
     * @param dbClient - The database client instance.
     * @param id - The ID of the subject to delete.
     * @param institutionId - The institution ID context.
     * @param actorUserId - The ID of the user performing the deletion.
     */
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
                subjectLabel: ManageSubjectsService.buildSubjectLabel(subject ?? {}),
            });
        }
    }

    /**
     * Bulk deletes multiple subjects and dispatches activity notifications.
     *
     * @param dbClient - The database client instance.
     * @param ids - The array of subject IDs to delete.
     * @param institutionId - The institution ID context.
     * @param actorUserId - The ID of the user performing the deletion.
     * @returns An object containing the count of deleted subjects.
     */
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
