import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { AnnouncementRepository } from '../data/announcement.repository';
import { AnnouncementNotificationService } from './announcement-notification.service';
import type { CreateAnnouncementDto, UpdateAnnouncementDto } from '../announcement.dto';

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export class AnnouncementCrudService {
    private readonly repository: AnnouncementRepository;
    private readonly notificationService: AnnouncementNotificationService;

    constructor(db: DbClient) {
        this.repository = new AnnouncementRepository(db);
        this.notificationService = new AnnouncementNotificationService(db);
    }

    /**
     * Creates a new announcement. Auto-generates a slug, and notifies if published.
     */
    create = async (
        dto: CreateAnnouncementDto,
        authorId: string,
        institutionId: string | null,
    ) => {
        const titleSlug = dto.slug || generateSlug(dto.title);
        let uniqueSlug = titleSlug;
        let counter = 1;
        while (await this.repository.findBySlug(uniqueSlug)) {
            uniqueSlug = `${titleSlug}-${counter}`;
            counter++;
        }

        const announcement = await this.repository.create({
            title: dto.title,
            slug: uniqueSlug,
            content: dto.content,
            published_at: dto.published_at ? new Date(dto.published_at) : null,
            unpublished_at: dto.unpublished_at ? new Date(dto.unpublished_at) : null,
            author_id: authorId,
            institution_id: institutionId,
        });

        if (announcement.published_at) {
            await this.notificationService.onPublish(announcement);
        }

        return announcement;
    };

    /**
     * Updates an existing announcement. Regenerates slug if title changes and no custom slug is given.
     */
    update = async (
        id: string,
        dto: UpdateAnnouncementDto,
        institutionId: string | null,
        options?: { notifyOnUpdate?: boolean },
    ) => {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new HTTPException(404, { message: 'Announcement not found.' });
        }
        if (
            institutionId &&
            existing.institution_id &&
            existing.institution_id !== institutionId
        ) {
            throw new HTTPException(403, {
                message: 'Forbidden. You do not have access to this announcement.',
            });
        }

        const updateData: any = {};
        if (dto.title !== undefined) {
            updateData.title = dto.title;
            if (!dto.slug) {
                const titleSlug = generateSlug(dto.title);
                let uniqueSlug = titleSlug;
                let counter = 1;
                while (true) {
                    const found = await this.repository.findBySlug(uniqueSlug);
                    if (!found || found.id === id) {
                        break;
                    }
                    uniqueSlug = `${titleSlug}-${counter}`;
                    counter++;
                }
                updateData.slug = uniqueSlug;
            }
        }

        if (dto.slug !== undefined) {
            let uniqueSlug = dto.slug;
            let counter = 1;
            while (true) {
                const found = await this.repository.findBySlug(uniqueSlug);
                if (!found || found.id === id) {
                    break;
                }
                uniqueSlug = `${dto.slug}-${counter}`;
                counter++;
            }
            updateData.slug = uniqueSlug;
        }

        if (dto.content !== undefined) updateData.content = dto.content;
        if (dto.published_at !== undefined) {
            updateData.published_at = dto.published_at ? new Date(dto.published_at) : null;
        }
        if (dto.unpublished_at !== undefined) {
            updateData.unpublished_at = dto.unpublished_at ? new Date(dto.unpublished_at) : null;
        }

        const updated = await this.repository.update(id, updateData);

        const wasDraft = !existing.published_at;
        const isPublished = !!updated.published_at;

        if (wasDraft && isPublished) {
            await this.notificationService.onPublish(updated);
        } else if (isPublished && options?.notifyOnUpdate) {
            await this.notificationService.onUpdate(updated, { notify: true });
        }

        return updated;
    };

    /**
     * Soft-deletes an announcement.
     */
    remove = async (id: string, institutionId: string | null) => {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new HTTPException(404, { message: 'Announcement not found.' });
        }
        if (
            institutionId &&
            existing.institution_id &&
            existing.institution_id !== institutionId
        ) {
            throw new HTTPException(403, {
                message: 'Forbidden. You do not have access to this announcement.',
            });
        }

        const deleted = await this.repository.softDelete(id);

        await this.notificationService.onDelete(deleted);

        return deleted;
    };
}
