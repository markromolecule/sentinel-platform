import { type DbClient } from '@sentinel/db';
import { NotificationService } from '../../notification/notification.service';

export class AnnouncementNotificationService {
    constructor(private readonly db: DbClient) {}

    /**
     * Broadcasts a notification to all users in the institution when an announcement is published.
     */
    async onPublish(announcement: {
        id: string;
        title: string;
        slug: string;
        institution_id: string | null;
        author_id: string | null;
    }) {
        let usersQuery = this.db.selectFrom('user_profiles').select(['user_id']);

        if (announcement.institution_id) {
            usersQuery = usersQuery.where('institution_id', '=', announcement.institution_id);
        }

        const users = await usersQuery.execute();

        let authorName = 'System';
        if (announcement.author_id) {
            const authorProfile = await this.db
                .selectFrom('user_profiles')
                .select(['first_name', 'last_name'])
                .where('user_id', '=', announcement.author_id)
                .executeTakeFirst();
            if (authorProfile) {
                authorName =
                    `${authorProfile.first_name || ''} ${authorProfile.last_name || ''}`.trim() ||
                    'System';
            }
        }

        // Exclude the author from receiving their own notification
        const recipients = users.filter((user) => user.user_id !== announcement.author_id);

        await Promise.all(
            recipients.map((user) =>
                NotificationService.createNotification({
                    dbClient: this.db,
                    recipientUserId: user.user_id,
                    actorUserId: announcement.author_id,
                    institutionId: announcement.institution_id,
                    title: 'New Announcement',
                    message: `${authorName} published: "${announcement.title}"`,
                    actionType: 'ANNOUNCEMENT_PUBLISHED',
                    resourceType: 'ANNOUNCEMENT',
                    resourceId: announcement.id,
                    resourceLabel: announcement.title,
                    metadata: {
                        announcementId: announcement.id,
                        title: announcement.title,
                        slug: announcement.slug,
                    },
                }).catch((err) => {
                    console.error(
                        `Failed to notify user ${user.user_id} on announcement publish:`,
                        err,
                    );
                }),
            ),
        );
    }

    /**
     * Broadcasts a notification when a published announcement is updated.
     */
    async onUpdate(
        announcement: {
            id: string;
            title: string;
            slug: string;
            institution_id: string | null;
            author_id: string | null;
        },
        options?: { notify?: boolean },
    ) {
        if (!options?.notify) return;

        let usersQuery = this.db.selectFrom('user_profiles').select(['user_id']);

        if (announcement.institution_id) {
            usersQuery = usersQuery.where('institution_id', '=', announcement.institution_id);
        }

        const users = await usersQuery.execute();

        let authorName = 'System';
        if (announcement.author_id) {
            const authorProfile = await this.db
                .selectFrom('user_profiles')
                .select(['first_name', 'last_name'])
                .where('user_id', '=', announcement.author_id)
                .executeTakeFirst();
            if (authorProfile) {
                authorName =
                    `${authorProfile.first_name || ''} ${authorProfile.last_name || ''}`.trim() ||
                    'System';
            }
        }

        // Exclude the author from receiving their own notification
        const recipients = users.filter((user) => user.user_id !== announcement.author_id);

        await Promise.all(
            recipients.map((user) =>
                NotificationService.createNotification({
                    dbClient: this.db,
                    recipientUserId: user.user_id,
                    actorUserId: announcement.author_id,
                    institutionId: announcement.institution_id,
                    title: 'Announcement Updated',
                    message: `${authorName} updated: "${announcement.title}"`,
                    actionType: 'ANNOUNCEMENT_UPDATED',
                    resourceType: 'ANNOUNCEMENT',
                    resourceId: announcement.id,
                    resourceLabel: announcement.title,
                    metadata: {
                        announcementId: announcement.id,
                        title: announcement.title,
                        slug: announcement.slug,
                    },
                }).catch((err) => {
                    console.error(
                        `Failed to notify user ${user.user_id} on announcement update:`,
                        err,
                    );
                }),
            ),
        );
    }

    /**
     * Handles cleanup or optional notification on delete.
     */
    async onDelete(
        announcement: {
            id: string;
            title: string;
            slug: string;
            institution_id: string | null;
            author_id: string | null;
        },
        options?: { notify?: boolean },
    ) {
        if (!options?.notify) return;
        // Optional implementation
    }
}
