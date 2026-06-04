import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CoreProfilePage from './page';
import { useProfileQuery, useUpdatePasswordMutation } from '@sentinel/hooks';
import React from 'react';

vi.mock('@sentinel/hooks', () => ({
    useProfileQuery: vi.fn(),
    useUpdatePasswordMutation: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('CoreProfilePage', () => {
    it('renders profile details', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                role: 'admin',
                institution: 'Main Campus',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        vi.mocked(useUpdatePasswordMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useUpdatePasswordMutation>);

        render(<CoreProfilePage />);

        expect(screen.getByText('Admin User')).toBeTruthy();
        expect(screen.getByText('admin@example.com')).toBeTruthy();
        expect(screen.getByText('Admin')).toBeTruthy();
        expect(screen.getByText('Main Campus')).toBeTruthy();
    });

    it('submits password change mutation', () => {
        const mutateMock = vi.fn();
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        vi.mocked(useUpdatePasswordMutation).mockReturnValue({
            mutate: mutateMock,
            isPending: false,
        } as unknown as ReturnType<typeof useUpdatePasswordMutation>);

        render(<CoreProfilePage />);

        const newPasswordInput = screen.getByLabelText('New Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
        const submitButton = screen.getAllByRole('button', { name: 'Update Password' })[0];

        fireEvent.change(newPasswordInput, { target: { value: 'admin-pass-123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'admin-pass-123' } });
        fireEvent.click(submitButton);

        expect(mutateMock).toHaveBeenCalled();
    });
});
