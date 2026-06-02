import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { dbClient } from '@sentinel/db';
import { AnnouncementService } from './announcement.service';
import { HTTPException } from 'hono/http-exception';

describe('AnnouncementService Integration', () => {
    let service: AnnouncementService;
    const testInstitutionId = '44444444-4444-4444-4444-444444444444';
    let testAuthorId: string;
    const createdIds: string[] = [];

    beforeEach(async () => {
        service = new AnnouncementService(dbClient);

        // Find a valid user to act as author to satisfy foreign key constraints
        const user = await dbClient
            .selectFrom('users')
            .select(['id'])
            .executeTakeFirst();

        if (!user) {
            throw new Error('No user found in database to use as author');
        }
        testAuthorId = user.id;

        // Ensure the test institution exists in the database
        await dbClient
            .insertInto('institutions')
            .values({
                id: testInstitutionId,
                name: 'Test Services Institution',
            })
            .onConflict((oc) => oc.column('id').doNothing())
            .execute();
    });

    afterEach(async () => {
        // Clean up created announcements
        if (createdIds.length > 0) {
            await dbClient
                .deleteFrom('announcements')
                .where('id', 'in', createdIds)
                .execute();
            createdIds.length = 0;
        }
    });

    describe('create', () => {
        it('should successfully create an announcement and auto-generate slug', async () => {
            const announcement = await service.create(
                {
                    title: 'Service Test Announcement',
                    content: 'Testing the announcement service.',
                },
                testAuthorId,
                testInstitutionId,
            );

            expect(announcement).toBeDefined();
            expect(announcement.id).toBeDefined();
            createdIds.push(announcement.id);

            expect(announcement.title).toBe('Service Test Announcement');
            expect(announcement.slug).toBe('service-test-announcement');
            expect(announcement.published_at).toBeNull();
        });

        it('should resolve slug collisions by appending counter suffix', async () => {
            const ann1 = await service.create(
                {
                    title: 'Unique Title',
                    content: 'Content 1',
                },
                testAuthorId,
                testInstitutionId,
            );
            createdIds.push(ann1.id);
            expect(ann1.slug).toBe('unique-title');

            const ann2 = await service.create(
                {
                    title: 'Unique Title',
                    content: 'Content 2',
                },
                testAuthorId,
                testInstitutionId,
            );
            createdIds.push(ann2.id);
            expect(ann2.slug).toBe('unique-title-1');
        });
    });

    describe('querying and filters', () => {
        it('should fetch paginated announcements excluding soft-deleted ones', async () => {
            const ann1 = await service.create(
                {
                    title: 'Query Announcement 1',
                    content: 'Content 1',
                    published_at: new Date().toISOString(),
                },
                testAuthorId,
                testInstitutionId,
            );
            createdIds.push(ann1.id);

            const ann2 = await service.create(
                {
                    title: 'Query Announcement 2',
                    content: 'Content 2',
                },
                testAuthorId,
                testInstitutionId,
            );
            createdIds.push(ann2.id);

            // Fetch all
            const allResult = await service.findAll({ status: 'all' }, testInstitutionId);
            expect(allResult.total).toBeGreaterThanOrEqual(2);
            expect(allResult.items.some((item) => item.id === ann1.id)).toBe(true);
            expect(allResult.items.some((item) => item.id === ann2.id)).toBe(true);

            // Fetch published only
            const publishedResult = await service.findAll(
                { status: 'published' },
                testInstitutionId,
            );
            expect(publishedResult.items.some((item) => item.id === ann1.id)).toBe(true);
            expect(publishedResult.items.some((item) => item.id === ann2.id)).toBe(false);

            // Fetch drafts only
            const draftResult = await service.findAll({ status: 'draft' }, testInstitutionId);
            expect(draftResult.items.some((item) => item.id === ann1.id)).toBe(false);
            expect(draftResult.items.some((item) => item.id === ann2.id)).toBe(true);

            // Search
            const searchResult = await service.findAll(
                { search: 'Query Announcement 1' },
                testInstitutionId,
            );
            expect(searchResult.items.some((item) => item.id === ann1.id)).toBe(true);
            expect(searchResult.items.some((item) => item.id === ann2.id)).toBe(false);
        });

        it('should throw 404 on findById and findBySlug if not found or soft-deleted', async () => {
            const ann = await service.create(
                {
                    title: 'To Be Soft Deleted',
                    content: 'Content',
                },
                testAuthorId,
                testInstitutionId,
            );
            createdIds.push(ann.id);

            const found = await service.findById(ann.id, testInstitutionId);
            expect(found.title).toBe('To Be Soft Deleted');

            const foundSlug = await service.findBySlug(ann.slug, testInstitutionId);
            expect(foundSlug.title).toBe('To Be Soft Deleted');

            // Soft delete
            await service.remove(ann.id, testInstitutionId);

            await expect(service.findById(ann.id, testInstitutionId)).rejects.toThrowError(
                new HTTPException(404, { message: 'Announcement not found.' }),
            );
            await expect(service.findBySlug(ann.slug, testInstitutionId)).rejects.toThrowError(
                new HTTPException(404, { message: 'Announcement not found.' }),
            );
        });
    });

    describe('update', () => {
        it('should update fields and regenerate slug if title changes', async () => {
            const ann = await service.create(
                {
                    title: 'Original Title',
                    content: 'Original Content',
                },
                testAuthorId,
                testInstitutionId,
            );
            createdIds.push(ann.id);
            expect(ann.slug).toBe('original-title');

            const updated = await service.update(
                ann.id,
                {
                    title: 'Brand New Title',
                    content: 'Updated Content',
                },
                testInstitutionId,
            );

            expect(updated.title).toBe('Brand New Title');
            expect(updated.slug).toBe('brand-new-title');
            expect(updated.content).toBe('Updated Content');
        });

        it('should not regenerate slug if title is not changed', async () => {
            const ann = await service.create(
                {
                    title: 'Same Title',
                    content: 'Content',
                },
                testAuthorId,
                testInstitutionId,
            );
            createdIds.push(ann.id);

            const updated = await service.update(
                ann.id,
                {
                    content: 'Different Content',
                },
                testInstitutionId,
            );

            expect(updated.slug).toBe('same-title');
        });
    });
});
