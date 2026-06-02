import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { columns } from './columns';
import { Announcement } from '@sentinel/services';

const createMockAnnouncement = (overrides?: Partial<Announcement>): Announcement => ({
    id: '1',
    title: 'Test Title',
    slug: 'test-title',
    content: 'Test content of the announcement',
    published_at: null,
    unpublished_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    author_id: 'author-123',
    institution_id: 'inst-123',
    ...overrides,
});

describe('announcements column definitions', () => {
    const statusColumn = columns.find((c) => c.id === 'status');

    it('has a status column defined', () => {
        expect(statusColumn).toBeDefined();
        expect(statusColumn?.cell).toBeDefined();
    });

    it('renders "draft" status badge when published_at and unpublished_at are null', () => {
        if (!statusColumn || !statusColumn.cell) return;
        const announcement = createMockAnnouncement();
        const Cell = statusColumn.cell as Function;
        
        render(Cell({ row: { original: announcement } }));
        expect(screen.getByText('draft')).toBeDefined();
    });

    it('renders "published" status badge when published_at is set', () => {
        if (!statusColumn || !statusColumn.cell) return;
        const announcement = createMockAnnouncement({
            published_at: new Date().toISOString(),
        });
        const Cell = statusColumn.cell as Function;
        
        render(Cell({ row: { original: announcement } }));
        expect(screen.getByText('published')).toBeDefined();
    });

    it('renders "unpublished" status badge when unpublished_at is set', () => {
        if (!statusColumn || !statusColumn.cell) return;
        const announcement = createMockAnnouncement({
            published_at: new Date().toISOString(),
            unpublished_at: new Date().toISOString(),
        });
        const Cell = statusColumn.cell as Function;
        
        render(Cell({ row: { original: announcement } }));
        expect(screen.getByText('unpublished')).toBeDefined();
    });
});
