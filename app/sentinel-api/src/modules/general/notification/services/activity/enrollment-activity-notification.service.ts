import { type DbClient } from '@sentinel/db';
import { NotificationService } from '../../notification.service';
import {
    buildSubjectLabel,
    formatCountLabel,
    getInstitutionUsersWithPermission,
    getSubjectEnrollmentNotificationGroups,
    getUserDisplayName,
    toUniqueIds,
} from './activity-notification-base.service';

export class EnrollmentActivityNotificationService {
    static async notifySubjectEnrollmentRequestSubmitted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectOfferingId: string;
        subjectLabel: string;
        requestIds: string[];
        requestCount: number;
    }) {
        const {
            dbClient,
            actorUserId,
            institutionId,
            subjectOfferingId,
            subjectLabel,
            requestIds,
            requestCount,
        } = args;

        const uniqueRequestIds = toUniqueIds(requestIds);

        if (uniqueRequestIds.length === 0 || requestCount <= 0) {
            return;
        }

        const actorName = await getUserDisplayName(dbClient, actorUserId);
        const recipients = await getInstitutionUsersWithPermission({
            dbClient,
            institutionId,
            permissionKey: 'subject_requests:approve',
            excludeUserId: actorUserId,
        });

        await Promise.all(
            recipients.map((recipient) =>
                NotificationService.createNotification({
                    dbClient,
                    recipientUserId: recipient.userId,
                    actorUserId,
                    institutionId,
                    title: 'New subject enrollment request',
                    message: `${actorName} submitted a subject enrollment request for "${subjectLabel}" (${formatCountLabel(requestCount)}).`,
                    actionType: 'SUBJECT_ENROLLMENT_REQUEST_SUBMITTED',
                    resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
                    resourceId: subjectOfferingId,
                    resourceLabel: subjectLabel,
                    metadata: {
                        requestIds: uniqueRequestIds,
                        requestCount,
                        subjectOfferingId,
                    },
                }),
            ),
        );
    }

    static async notifySubjectEnrollmentRequestApproved(args: {
        dbClient: DbClient;
        actorUserId: string;
        requestIds: string[];
    }) {
        const { dbClient, actorUserId, requestIds } = args;
        const uniqueRequestIds = toUniqueIds(requestIds);

        if (uniqueRequestIds.length === 0) {
            return;
        }

        const actorName = await getUserDisplayName(dbClient, actorUserId);
        const groups = await getSubjectEnrollmentNotificationGroups({
            dbClient,
            requestIds: uniqueRequestIds,
        });

        await Promise.all(
            groups.map((group) =>
                NotificationService.createNotification({
                    dbClient,
                    recipientUserId: group.requesterUserId,
                    actorUserId,
                    institutionId: group.institutionId,
                    title: 'Subject enrollment request approved',
                    message: `${actorName} approved your subject enrollment request for "${buildSubjectLabel(group.subjectCode, group.subjectTitle)}" (${formatCountLabel(group.requestCount)}).`,
                    actionType: 'SUBJECT_ENROLLMENT_REQUEST_APPROVED',
                    resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
                    resourceId: group.subjectOfferingId,
                    resourceLabel: buildSubjectLabel(group.subjectCode, group.subjectTitle),
                    metadata: {
                        requestIds: group.requestIds,
                        requestCount: group.requestCount,
                        subjectOfferingId: group.subjectOfferingId,
                    },
                }),
            ),
        );
    }

    static async notifySubjectEnrollmentRequestRejected(args: {
        dbClient: DbClient;
        actorUserId: string;
        requestIds: string[];
    }) {
        const { dbClient, actorUserId, requestIds } = args;
        const uniqueRequestIds = toUniqueIds(requestIds);

        if (uniqueRequestIds.length === 0) {
            return;
        }

        const actorName = await getUserDisplayName(dbClient, actorUserId);
        const groups = await getSubjectEnrollmentNotificationGroups({
            dbClient,
            requestIds: uniqueRequestIds,
        });

        await Promise.all(
            groups.map((group) =>
                NotificationService.createNotification({
                    dbClient,
                    recipientUserId: group.requesterUserId,
                    actorUserId,
                    institutionId: group.institutionId,
                    title: 'Subject enrollment request rejected',
                    message: `${actorName} rejected your subject enrollment request for "${buildSubjectLabel(group.subjectCode, group.subjectTitle)}" (${formatCountLabel(group.requestCount)}).`,
                    actionType: 'SUBJECT_ENROLLMENT_REQUEST_REJECTED',
                    resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
                    resourceId: group.subjectOfferingId,
                    resourceLabel: buildSubjectLabel(group.subjectCode, group.subjectTitle),
                    metadata: {
                        requestIds: group.requestIds,
                        requestCount: group.requestCount,
                        subjectOfferingId: group.subjectOfferingId,
                    },
                }),
            ),
        );
    }
}
