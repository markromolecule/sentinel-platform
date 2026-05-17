import { type DbClient } from '@sentinel/db';
import { type GenericOperation } from './activity/activity-notification-base.service';
import { EnrollmentActivityNotificationService } from './activity/enrollment-activity-notification.service';
import { SectionActivityNotificationService } from './activity/section-activity-notification.service';
import { SubjectActivityNotificationService } from './activity/subject-activity-notification.service';
import { SupportActivityNotificationService } from './activity/support-activity-notification.service';
import { GenericActivityNotificationService } from './activity/generic-activity-notification.service';

export class ActivityNotificationService {
    static async notifyGenericInstitutionActivity(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        operation: GenericOperation;
        targetType: string;
        targetId?: string | null;
        targetLabel: string;
        title: string;
        message: string;
        sourceModule: string;
        sourceAction: string;
        metadata?: Record<string, unknown> | null;
        isAdminOverride?: boolean;
    }) {
        await GenericActivityNotificationService.notifyGenericInstitutionActivity(args);
    }

    static async notifySubjectEnrollmentRequestSubmitted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectOfferingId: string;
        subjectLabel: string;
        requestIds: string[];
        requestCount: number;
    }) {
        await EnrollmentActivityNotificationService.notifySubjectEnrollmentRequestSubmitted(args);
    }

    static async notifySubjectEnrollmentRequestApproved(args: {
        dbClient: DbClient;
        actorUserId: string;
        requestIds: string[];
    }) {
        await EnrollmentActivityNotificationService.notifySubjectEnrollmentRequestApproved(args);
    }

    static async notifySubjectEnrollmentRequestRejected(args: {
        dbClient: DbClient;
        actorUserId: string;
        requestIds: string[];
    }) {
        await EnrollmentActivityNotificationService.notifySubjectEnrollmentRequestRejected(args);
    }

    static async notifySectionCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        sectionId: string;
        sectionLabel: string;
    }) {
        await SectionActivityNotificationService.notifySectionCreated(args);
    }

    static async notifySectionsBulkCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        count: number;
    }) {
        await SectionActivityNotificationService.notifySectionsBulkCreated(args);
    }

    static async notifySectionUpdated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        sectionId: string;
        sectionLabel: string;
    }) {
        await SectionActivityNotificationService.notifySectionUpdated(args);
    }

    static async notifySectionDeleted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        sectionId?: string | null;
        sectionLabel: string;
        bulk?: boolean;
        count?: number;
    }) {
        await SectionActivityNotificationService.notifySectionDeleted(args);
    }

    static async notifySubjectCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectId: string;
        subjectLabel: string;
    }) {
        await SubjectActivityNotificationService.notifySubjectCreated(args);
    }

    static async notifySubjectUpdated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectId: string;
        subjectLabel: string;
    }) {
        await SubjectActivityNotificationService.notifySubjectUpdated(args);
    }

    static async notifySubjectDeleted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectId?: string | null;
        subjectLabel: string;
        bulk?: boolean;
        count?: number;
    }) {
        await SubjectActivityNotificationService.notifySubjectDeleted(args);
    }

    static async notifySubjectClassificationCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        classificationId: string;
        classificationLabel: string;
    }) {
        await SubjectActivityNotificationService.notifySubjectClassificationCreated(args);
    }

    static async notifySubjectClassificationUpdated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        classificationId: string;
        classificationLabel: string;
    }) {
        await SubjectActivityNotificationService.notifySubjectClassificationUpdated(args);
    }

    static async notifySubjectClassificationDeleted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        classificationId: string;
        classificationLabel: string;
    }) {
        await SubjectActivityNotificationService.notifySubjectClassificationDeleted(args);
    }

    static async notifySupportInstitutionOperationCompleted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        institutionRecordId: string;
        institutionLabel: string;
        operation: 'CREATED' | 'UPDATED' | 'DELETED';
    }) {
        await SupportActivityNotificationService.notifySupportInstitutionOperationCompleted(args);
    }
}
