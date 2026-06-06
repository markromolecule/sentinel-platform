import { type DbClient } from '@sentinel/db';
import { AnnouncementCrudService } from './services/announcement-crud.service';
import { AnnouncementQueryService } from './services/announcement-query.service';
import { AnnouncementNotificationService } from './services/announcement-notification.service';
import type {
    CreateAnnouncementDto,
    UpdateAnnouncementDto,
    AnnouncementQueryParams,
} from './announcement.dto';

export class AnnouncementService {
    private readonly crud: AnnouncementCrudService;
    private readonly query: AnnouncementQueryService;
    private readonly notification: AnnouncementNotificationService;

    constructor(db: DbClient) {
        this.crud = new AnnouncementCrudService(db);
        this.query = new AnnouncementQueryService(db);
        this.notification = new AnnouncementNotificationService(db);
    }

    create = async (dto: CreateAnnouncementDto, authorId: string, institutionId: string | null) => {
        return await this.crud.create(dto, authorId, institutionId);
    };

    update = async (
        id: string,
        dto: UpdateAnnouncementDto,
        institutionId: string | null,
        options?: { notifyOnUpdate?: boolean },
    ) => {
        return await this.crud.update(id, dto, institutionId, options);
    };

    remove = async (id: string, institutionId: string | null) => {
        return await this.crud.remove(id, institutionId);
    };

    findAll = async (params: AnnouncementQueryParams, institutionId?: string | null) => {
        return await this.query.findAll(params, institutionId);
    };

    findById = async (id: string, institutionId?: string | null) => {
        return await this.query.findById(id, institutionId);
    };

    findBySlug = async (slug: string, institutionId?: string | null) => {
        return await this.query.findBySlug(slug, institutionId);
    };
}
