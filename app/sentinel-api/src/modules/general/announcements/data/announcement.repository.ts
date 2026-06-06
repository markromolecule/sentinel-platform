import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { AnnouncementQueryParams } from '../announcement.dto';

export class AnnouncementRepository {
    constructor(private readonly db: DbClient) {}

    /**
     * Creates a new announcement record in the database.
     */
    async create(data: {
        title: string;
        slug: string;
        content: string;
        published_at?: Date | null;
        unpublished_at?: Date | null;
        author_id?: string | null;
        institution_id?: string | null;
    }) {
        return await this.db
            .insertInto('announcements')
            .values({
                title: data.title,
                slug: data.slug,
                content: data.content,
                published_at: data.published_at ?? null,
                unpublished_at: data.unpublished_at ?? null,
                author_id: data.author_id ?? null,
                institution_id: data.institution_id ?? null,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    /**
     * Updates an existing announcement record.
     */
    async update(
        id: string,
        data: Partial<{
            title: string;
            slug: string;
            content: string;
            published_at: Date | null;
            unpublished_at: Date | null;
        }>,
    ) {
        return await this.db
            .updateTable('announcements')
            .set({
                ...data,
                updated_at: new Date(),
            })
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    /**
     * Soft-deletes an announcement record by setting deleted_at.
     */
    async softDelete(id: string) {
        return await this.db
            .updateTable('announcements')
            .set({
                deleted_at: new Date(),
                updated_at: new Date(),
            })
            .where('id', '=', id)
            .where('deleted_at', 'is', null)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    /**
     * Finds a single announcement by its ID.
     */
    async findById(id: string) {
        return await this.db
            .selectFrom('announcements')
            .leftJoin(
                'user_profiles as author_profile',
                'author_profile.user_id',
                'announcements.author_id',
            )
            .select([
                'announcements.id',
                'announcements.title',
                'announcements.slug',
                'announcements.content',
                'announcements.published_at',
                'announcements.unpublished_at',
                'announcements.created_at',
                'announcements.updated_at',
                'announcements.deleted_at',
                'announcements.author_id',
                'announcements.institution_id',
                sql<
                    string | null
                >`concat(author_profile.first_name, ' ', author_profile.last_name)`.as(
                    'author_name',
                ),
            ])
            .where('announcements.id', '=', id)
            .where('announcements.deleted_at', 'is', null)
            .executeTakeFirst();
    }

    /**
     * Finds a single announcement by its slug.
     */
    async findBySlug(slug: string) {
        return await this.db
            .selectFrom('announcements')
            .leftJoin(
                'user_profiles as author_profile',
                'author_profile.user_id',
                'announcements.author_id',
            )
            .select([
                'announcements.id',
                'announcements.title',
                'announcements.slug',
                'announcements.content',
                'announcements.published_at',
                'announcements.unpublished_at',
                'announcements.created_at',
                'announcements.updated_at',
                'announcements.deleted_at',
                'announcements.author_id',
                'announcements.institution_id',
                sql<
                    string | null
                >`concat(author_profile.first_name, ' ', author_profile.last_name)`.as(
                    'author_name',
                ),
            ])
            .where('announcements.slug', '=', slug)
            .where('announcements.deleted_at', 'is', null)
            .executeTakeFirst();
    }

    /**
     * Finds all announcements matching the params, scoped optionally to an institution.
     */
    async findAll(params: AnnouncementQueryParams, institutionId?: string | null) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const offset = (page - 1) * limit;
        const sortBy = params.sortBy || 'created_at';
        const sortOrder = params.sortOrder || 'desc';
        const now = new Date();

        let query = this.db
            .selectFrom('announcements')
            .leftJoin(
                'user_profiles as author_profile',
                'author_profile.user_id',
                'announcements.author_id',
            )
            .select([
                'announcements.id',
                'announcements.title',
                'announcements.slug',
                'announcements.content',
                'announcements.published_at',
                'announcements.unpublished_at',
                'announcements.created_at',
                'announcements.updated_at',
                'announcements.deleted_at',
                'announcements.author_id',
                'announcements.institution_id',
                sql<
                    string | null
                >`concat(author_profile.first_name, ' ', author_profile.last_name)`.as(
                    'author_name',
                ),
            ])
            .where('announcements.deleted_at', 'is', null);

        let countQuery = this.db
            .selectFrom('announcements')
            .select((eb) => eb.fn.count('id').as('total'))
            .where('deleted_at', 'is', null);

        // Apply Institution filter if provided
        if (institutionId) {
            query = query.where('announcements.institution_id', '=', institutionId);
            countQuery = countQuery.where('institution_id', '=', institutionId);
        }

        // Apply status filter
        if (params.status === 'draft') {
            query = query.where('announcements.published_at', 'is', null);
            countQuery = countQuery.where('published_at', 'is', null);
        } else if (params.status === 'published') {
            query = query
                .where('announcements.published_at', '<=', now)
                .where((eb) =>
                    eb.or([
                        eb('announcements.unpublished_at', 'is', null),
                        eb('announcements.unpublished_at', '>', now),
                    ]),
                );
            countQuery = countQuery
                .where('published_at', '<=', now)
                .where((eb) =>
                    eb.or([eb('unpublished_at', 'is', null), eb('unpublished_at', '>', now)]),
                );
        } else if (params.status === 'unpublished') {
            query = query
                .where('announcements.unpublished_at', 'is not', null)
                .where('announcements.unpublished_at', '<=', now);
            countQuery = countQuery
                .where('unpublished_at', 'is not', null)
                .where('unpublished_at', '<=', now);
        }

        // Apply search filter on title and content
        if (params.search) {
            const searchPattern = `%${params.search}%`;
            query = query.where((eb) =>
                eb.or([
                    eb('announcements.title', 'ilike', searchPattern),
                    eb('announcements.content', 'ilike', searchPattern),
                ]),
            );
            countQuery = countQuery.where((eb) =>
                eb.or([eb('title', 'ilike', searchPattern), eb('content', 'ilike', searchPattern)]),
            );
        }

        // Get total count
        const countResult = await countQuery.executeTakeFirst();
        const total = Number(countResult?.total || 0);

        // Fetch paginated items
        const items = await query
            .orderBy(`announcements.${sortBy}` as any, sortOrder)
            .limit(limit)
            .offset(offset)
            .execute();

        return { items, total };
    }
}
