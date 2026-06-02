import { z } from 'zod';

export const notificationStatusSchema = z.enum(['UNREAD', 'READ']);
export const notificationResourceTypeSchema = z.enum([
    'EXAM_ASSIGNMENT',
    'CLASSROOM_INSTRUCTOR_ASSIGNMENT',
    'SUBJECT_ENROLLMENT_REQUEST',
    'SECTION',
    'SUBJECT',
    'SUBJECT_CLASSIFICATION',
    'SUPPORT_OPERATION',
    'INSTITUTION_ACTIVITY',
    'INSTRUCTOR_SUBJECT_REQUEST',
    'ANNOUNCEMENT',
]);
export const notificationActionTypeSchema = z.enum([
    'EXAM_ASSIGNMENT_CREATED',
    'EXAM_ASSIGNMENT_ACCEPTED',
    'EXAM_ASSIGNMENT_REJECTED',
    'CLASSROOM_INSTRUCTOR_ASSIGNED',
    'CLASSROOM_INSTRUCTOR_UNASSIGNED',
    'CLASSROOM_INSTRUCTOR_ASSIGNMENT_ACKNOWLEDGED',
    'CLASSROOM_INSTRUCTOR_ASSIGNMENT_FLAGGED',
    'SUBJECT_ENROLLMENT_REQUEST_SUBMITTED',
    'SUBJECT_ENROLLMENT_REQUEST_APPROVED',
    'SUBJECT_ENROLLMENT_REQUEST_REJECTED',
    'SECTION_CREATED',
    'SECTION_UPDATED',
    'SECTION_DELETED',
    'SUBJECT_CREATED',
    'SUBJECT_UPDATED',
    'SUBJECT_DELETED',
    'SUBJECT_CLASSIFICATION_CREATED',
    'SUBJECT_CLASSIFICATION_UPDATED',
    'SUBJECT_CLASSIFICATION_DELETED',
    'SUPPORT_OPERATION_COMPLETED',
    'INSTITUTION_ACTIVITY_CREATED',
    'INSTITUTION_ACTIVITY_UPDATED',
    'INSTITUTION_ACTIVITY_DELETED',
    'INSTITUTION_ACTIVITY_TRANSACTION_COMPLETED',
    'INSTITUTION_ACTIVITY_OVERRIDE_COMPLETED',
    'INSTRUCTOR_SUBJECT_REQUEST_SUBMITTED',
    'INSTRUCTOR_SUBJECT_REQUEST_APPROVED',
    'INSTRUCTOR_SUBJECT_REQUEST_REJECTED',
    'ANNOUNCEMENT_PUBLISHED',
    'ANNOUNCEMENT_UPDATED',
]);

export const notificationActorSchema = z.object({
    id: z.string().uuid().nullable(),
    name: z.string().nullable(),
});

export const notificationResourceSchema = z.object({
    type: notificationResourceTypeSchema,
    id: z.string().uuid().nullable(),
    label: z.string().nullable(),
});

export const notificationSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    message: z.string(),
    status: notificationStatusSchema,
    actionType: notificationActionTypeSchema,
    institutionId: z.string().uuid().nullable(),
    actor: notificationActorSchema,
    resource: notificationResourceSchema,
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    createdAt: z.string(),
    readAt: z.string().nullable(),
});

export const notificationListSchema = z.object({
    items: z.array(notificationSchema),
    unreadCount: z.number().int().min(0),
});

export type NotificationStatusType = z.infer<typeof notificationStatusSchema>;
export type NotificationResourceType = z.infer<typeof notificationResourceTypeSchema>;
export type NotificationActionType = z.infer<typeof notificationActionTypeSchema>;
export type NotificationActorType = z.infer<typeof notificationActorSchema>;
export type NotificationResourceSummaryType = z.infer<typeof notificationResourceSchema>;
export type AppNotificationType = z.infer<typeof notificationSchema>;
export type NotificationListType = z.infer<typeof notificationListSchema>;
