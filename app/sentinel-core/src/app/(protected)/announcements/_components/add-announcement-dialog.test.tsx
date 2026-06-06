import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddAnnouncementDialog } from './add-announcement-dialog';
import { useCreateAnnouncementMutation } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useCreateAnnouncementMutation: vi.fn(),
}));

vi.mock('@sentinel/ui', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        Select: ({ children, onValueChange }: any) => (
            <div data-testid="mock-select" onClick={() => onValueChange?.('all')}>
                {children}
            </div>
        ),
        SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
        SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
        SelectContent: ({ children }: any) => <div>{children}</div>,
        SelectItem: ({ children, value }: any) => (
            <div data-testid={`select-item-${value}`}>{children}</div>
        ),
    };
});

describe('AddAnnouncementDialog', () => {
    const mockMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
        vi.mocked(useCreateAnnouncementMutation).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as any);
    });

    it('renders trigger button and opens dialog on click', async () => {
        render(<AddAnnouncementDialog />);

        const trigger = screen.getByRole('button', { name: /Post Announcement/i });
        expect(trigger).toBeDefined();

        fireEvent.click(trigger);

        await waitFor(() => {
            expect(screen.getAllByText('Post Announcement').length).toBeGreaterThan(0);
        });
    });

    it('submits form with correct values', async () => {
        render(<AddAnnouncementDialog />);

        // Open Dialog
        const trigger = screen.getByRole('button', { name: /Post Announcement/i });
        fireEvent.click(trigger);

        await waitFor(() => {
            expect(screen.getAllByText('Post Announcement').length).toBeGreaterThan(0);
        });

        // Fill Title
        fireEvent.change(screen.getByPlaceholderText('Scheduled Maintenance'), {
            target: { value: 'Maintenance Announcement' },
        });

        // Select Audience (triggers mocked onClick which calls onValueChange('all'))
        const selectTrigger = screen.getByText('Select audience');
        fireEvent.click(selectTrigger);

        // Fill Content
        fireEvent.change(screen.getByPlaceholderText('Enter announcement details...'), {
            target: {
                value: 'This is a long description that meets the length validation requirement.',
            },
        });

        // Submit
        const submitBtn = screen.getByRole('button', { name: 'Post Announcement' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalled();
        });

        const arg = mockMutate.mock.calls[0][0];
        expect(arg.title).toBe('Maintenance Announcement');
        expect(arg.content).toBe(
            'This is a long description that meets the length validation requirement.',
        );
        expect(arg.published_at).toBeDefined();
        expect(arg.unpublished_at).toBeNull();
    });
});
