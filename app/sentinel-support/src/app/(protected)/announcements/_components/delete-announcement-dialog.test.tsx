import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteAnnouncementDialog } from './delete-announcement-dialog';
import { useDeleteAnnouncementMutation } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useDeleteAnnouncementMutation: vi.fn(),
}));

describe('DeleteAnnouncementDialog', () => {
    const mockMutate = vi.fn();
    const mockOnOpenChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
        vi.mocked(useDeleteAnnouncementMutation).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as any);
    });

    it('renders delete dialog content and confirm deletes the item', () => {
        render(
            <DeleteAnnouncementDialog
                announcementId="123"
                announcementTitle="Test Title"
                open={true}
                onOpenChange={mockOnOpenChange}
            />,
        );

        expect(screen.getByText('Delete Announcement')).toBeDefined();
        expect(screen.getByText(/Test Title/)).toBeDefined();

        const deleteBtn = screen.getByRole('button', { name: 'Delete' });
        fireEvent.click(deleteBtn);

        expect(mockMutate).toHaveBeenCalledWith('123');
    });
});
