import { describe, it, expect } from 'vitest';
import { prisma } from '../db';

describe('Announcements Schema', () => {
    it('should insert, query, and soft-delete announcements', async () => {
        // Create a unique slug for testing
        const testSlug = `test-announcement-slug-${Date.now()}`;

        // Create
        const created = await prisma.announcements.create({
            data: {
                title: 'Test Announcement Title',
                slug: testSlug,
                content: 'Test content for announcement.',
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.slug).toBe(testSlug);
        expect(created.deleted_at).toBeNull();

        // Query
        const found = await prisma.announcements.findUnique({
            where: { id: created.id },
        });
        expect(found).toBeDefined();
        expect(found?.title).toBe('Test Announcement Title');

        // Soft-delete (update deleted_at)
        const deleted = await prisma.announcements.update({
            where: { id: created.id },
            data: {
                deleted_at: new Date(),
            },
        });
        expect(deleted.deleted_at).not.toBeNull();

        // Clean up (hard delete)
        await prisma.announcements.delete({
            where: { id: created.id },
        });
    });

    it('should enforce slug uniqueness', async () => {
        const testSlug = `test-unique-slug-${Date.now()}`;

        // Create first
        await prisma.announcements.create({
            data: {
                title: 'Announcement 1',
                slug: testSlug,
                content: 'Content 1',
            },
        });

        // Try to create second with same slug
        await expect(
            prisma.announcements.create({
                data: {
                    title: 'Announcement 2',
                    slug: testSlug,
                    content: 'Content 2',
                },
            }),
        ).rejects.toThrow();

        // Clean up
        await prisma.announcements.delete({
            where: { slug: testSlug },
        });
    });
});
