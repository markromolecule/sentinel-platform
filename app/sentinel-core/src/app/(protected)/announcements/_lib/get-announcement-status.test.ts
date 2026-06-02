import { describe, it, expect } from 'vitest';
import { getAnnouncementStatus } from './get-announcement-status';
import { Announcement } from '@sentinel/services';

const createMockAnnouncement = (overrides?: Partial<Announcement>): Announcement => ({
    id: '1',
    title: 'Test',
    slug: 'test',
    content: 'test content',
    published_at: null,
    unpublished_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    author_id: 'author-1',
    institution_id: 'inst-1',
    ...overrides,
});

describe('getAnnouncementStatus', () => {
    it('returns "draft" when both published_at and unpublished_at are null', () => {
        const announcement = createMockAnnouncement();
        expect(getAnnouncementStatus(announcement)).toBe('draft');
    });

    it('returns "published" when published_at is set and unpublished_at is null', () => {
        const announcement = createMockAnnouncement({
            published_at: new Date().toISOString(),
            unpublished_at: null,
        });
        expect(getAnnouncementStatus(announcement)).toBe('published');
    });

    it('returns "unpublished" when unpublished_at is set', () => {
        const announcement = createMockAnnouncement({
            published_at: new Date().toISOString(),
            unpublished_at: new Date().toISOString(),
        });
        expect(getAnnouncementStatus(announcement)).toBe('unpublished');
    });
});
