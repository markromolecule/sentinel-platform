import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteEventConfirmDialog } from './delete-event-confirm-dialog';

describe('DeleteEventConfirmDialog (sentinel-support)', () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        eventTitle: 'System Maintenance',
        onConfirm: vi.fn(),
    };

    it('renders the event title in the description', () => {
        render(<DeleteEventConfirmDialog {...defaultProps} />);
        expect(screen.getByText(/System Maintenance/)).toBeTruthy();
    });

    it('renders the Delete and Cancel buttons', () => {
        render(<DeleteEventConfirmDialog {...defaultProps} />);
        expect(screen.getByRole('button', { name: /delete/i })).toBeTruthy();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy();
    });

    it('calls onConfirm when Delete is clicked', () => {
        const onConfirm = vi.fn();
        render(<DeleteEventConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
        fireEvent.click(screen.getByRole('button', { name: /delete/i }));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenChange(false) when Cancel is clicked', () => {
        const onOpenChange = vi.fn();
        render(<DeleteEventConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows "Deleting..." and disables buttons when isDeleting is true', () => {
        render(<DeleteEventConfirmDialog {...defaultProps} isDeleting />);
        const deleteBtn = screen.getByRole('button', { name: /deleting/i });
        expect(deleteBtn).toBeTruthy();
        expect((deleteBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('renders with correct title heading', () => {
        render(<DeleteEventConfirmDialog {...defaultProps} />);
        expect(screen.getAllByText('Delete Event').length).toBeGreaterThan(0);
    });
});
