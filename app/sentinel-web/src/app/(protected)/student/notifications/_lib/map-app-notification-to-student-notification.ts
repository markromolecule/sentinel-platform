'use client';

import type { AppNotification } from '@sentinel/services';
import type { Notification } from '@sentinel/shared/types';

function mapNotificationType(actionType: AppNotification['actionType']): Notification['type'] {
    if (actionType.includes('EXAM')) {
        return 'exam';
    }

    if (
        actionType.includes('CLASSROOM') ||
        actionType.includes('SUBJECT') ||
        actionType.includes('SECTION') ||
        actionType.includes('INSTRUCTOR')
    ) {
        return 'class';
    }

    if (actionType.includes('SUPPORT') || actionType.includes('INSTITUTION')) {
        return 'system';
    }

    return 'alert';
}

function mapNotificationPriority(notification: AppNotification): Notification['priority'] {
    if (notification.status === 'READ') {
        return 'low';
    }

    if (
        notification.actionType.includes('REJECTED') ||
        notification.actionType.includes('DELETED') ||
        notification.actionType.includes('FLAGGED') ||
        notification.actionType.includes('OVERRIDE')
    ) {
        return 'high';
    }

    return 'medium';
}

function mapNotificationLink(notification: AppNotification): string | undefined {
    if (notification.resource.type === 'EXAM_ASSIGNMENT' && notification.resource.id) {
        return `/student/exam/${notification.resource.id}/instruction`;
    }

    if (notification.resource.type === 'INSTRUCTOR_SUBJECT_REQUEST' && notification.resource.id) {
        return '/student/history';
    }

    if (notification.resource.type === 'ANNOUNCEMENT' && notification.resource.id) {
        return '/student/classroom';
    }

    return undefined;
}

export function mapAppNotificationToStudentNotification(
    notification: AppNotification,
): Notification {
    return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: mapNotificationType(notification.actionType),
        priority: mapNotificationPriority(notification),
        isRead: notification.status === 'READ',
        date: new Date(notification.createdAt),
        link: mapNotificationLink(notification),
    };
}
