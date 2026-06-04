import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SupportProfilePage from './page';
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

describe('SupportProfilePage', () => {
    it('renders profile details', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                firstName: 'Jane',
                lastName: 'Support',
                email: 'jane.support@example.com',
                role: 'support',
                institution: 'Global Support Inc',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        vi.mocked(useUpdatePasswordMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useUpdatePasswordMutation>);

        render(<SupportProfilePage />);

        expect(screen.getByText('Jane Support')).toBeTruthy();
        expect(screen.getByText('jane.support@example.com')).toBeTruthy();
        expect(screen.getByText('Support')).toBeTruthy();
        expect(screen.getByText('Global Support Inc')).toBeTruthy();
    });

    it('submits password change mutation', () => {
        const mutateMock = vi.fn();
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                firstName: 'Jane',
                lastName: 'Support',
                email: 'jane.support@example.com',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        vi.mocked(useUpdatePasswordMutation).mockReturnValue({
            mutate: mutateMock,
            isPending: false,
        } as unknown as ReturnType<typeof useUpdatePasswordMutation>);

        render(<SupportProfilePage />);

        const newPasswordInput = screen.getByLabelText('New Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
        const submitButton = screen.getAllByRole('button', { name: 'Update Password' })[0];

        fireEvent.change(newPasswordInput, { target: { value: 'new-pass-123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'new-pass-123' } });
        fireEvent.click(submitButton);

        expect(mutateMock).toHaveBeenCalled();
    });
});
