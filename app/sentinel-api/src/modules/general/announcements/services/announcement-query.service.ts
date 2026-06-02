import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { AnnouncementRepository } from '../data/announcement.repository';
import type { AnnouncementQueryParams } from '../announcement.dto';

export class AnnouncementQueryService {
    private readonly repository: AnnouncementRepository;

    constructor(db: DbClient) {
        this.repository = new AnnouncementRepository(db);
    }

    /**
     * Lists all announcements matching pagination, filter, and search criteria.
     */
    findAll = async (params: AnnouncementQueryParams, institutionId?: string | null) => {
        return await this.repository.findAll(params, institutionId);
    };

    /**
     * Retrieves a single announcement by ID.
     * Throws 404 if not found or belongs to another institution.
     */
    findById = async (id: string, institutionId?: string | null) => {
        const announcement = await this.repository.findById(id);
        if (!announcement) {
            throw new HTTPException(404, { message: 'Announcement not found.' });
        }
        if (
            institutionId &&
            announcement.institution_id &&
            announcement.institution_id !== institutionId
        ) {
            throw new HTTPException(403, {
                message: 'Forbidden. You do not have access to this announcement.',
            });
        }
        return announcement;
    };

    /**
     * Retrieves a single announcement by Slug.
     * Throws 404 if not found or belongs to another institution.
     */
    findBySlug = async (slug: string, institutionId?: string | null) => {
        const announcement = await this.repository.findBySlug(slug);
        if (!announcement) {
            throw new HTTPException(404, { message: 'Announcement not found.' });
        }
        if (
            institutionId &&
            announcement.institution_id &&
            announcement.institution_id !== institutionId
        ) {
            throw new HTTPException(403, {
                message: 'Forbidden. You do not have access to this announcement.',
            });
        }
        return announcement;
    };
}
