type NotificationRow = {
    id: string;
    title: string;
    message: string;
    status: 'UNREAD' | 'READ' | null;
    actionType:
        | 'EXAM_ASSIGNMENT_CREATED'
        | 'EXAM_ASSIGNMENT_ACCEPTED'
        | 'EXAM_ASSIGNMENT_REJECTED'
        | 'CLASSROOM_INSTRUCTOR_ASSIGNED'
        | 'SUBJECT_ENROLLMENT_REQUEST_SUBMITTED'
        | 'SUBJECT_ENROLLMENT_REQUEST_APPROVED'
        | 'SUBJECT_ENROLLMENT_REQUEST_REJECTED'
        | 'SECTION_CREATED'
        | 'SECTION_UPDATED'
        | 'SECTION_DELETED'
        | 'SUBJECT_CREATED'
        | 'SUBJECT_UPDATED'
        | 'SUBJECT_DELETED'
        | 'SUBJECT_CLASSIFICATION_CREATED'
        | 'SUBJECT_CLASSIFICATION_UPDATED'
        | 'SUBJECT_CLASSIFICATION_DELETED'
        | 'SUPPORT_OPERATION_COMPLETED';
    institutionId: string | null;
    actorId: string | null;
    actorName: string | null;
    resourceType:
        | 'EXAM_ASSIGNMENT'
        | 'CLASSROOM_INSTRUCTOR_ASSIGNMENT'
        | 'SUBJECT_ENROLLMENT_REQUEST'
        | 'SECTION'
        | 'SUBJECT'
        | 'SUBJECT_CLASSIFICATION'
        | 'SUPPORT_OPERATION';
    resourceId: string | null;
    resourceLabel: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date | string | null;
    readAt: Date | string | null;
};

export function mapNotification(record: NotificationRow) {
    return {
        id: record.id,
        title: record.title,
        message: record.message,
        status: record.status ?? 'UNREAD',
        actionType: record.actionType,
        institutionId: record.institutionId,
        actor: {
            id: record.actorId,
            name: record.actorName,
        },
        resource: {
            type: record.resourceType,
            id: record.resourceId,
            label: record.resourceLabel,
        },
        metadata: record.metadata ?? null,
        createdAt: new Date(record.createdAt ?? new Date()).toISOString(),
        readAt: record.readAt ? new Date(record.readAt).toISOString() : null,
    };
}
