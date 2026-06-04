import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentProfilePage from './page';
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

describe('StudentProfilePage', () => {
    it('renders profile details', () => {
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                studentNo: '2026-999',
                department: 'Physics',
                institution: 'Science College',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        vi.mocked(useUpdatePasswordMutation).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof useUpdatePasswordMutation>);

        render(<StudentProfilePage />);

        expect(screen.getByText('Jane Doe')).toBeTruthy();
        expect(screen.getByText('jane.doe@example.com')).toBeTruthy();
        expect(screen.getByText('2026-999')).toBeTruthy();
        expect(screen.getByText('Physics')).toBeTruthy();
        expect(screen.getByText('Science College')).toBeTruthy();
    });

    it('submits password change and calls mutation', async () => {
        const mutateMock = vi.fn();
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useProfileQuery>);

        vi.mocked(useUpdatePasswordMutation).mockReturnValue({
            mutate: mutateMock,
            isPending: false,
        } as unknown as ReturnType<typeof useUpdatePasswordMutation>);

        render(<StudentProfilePage />);

        const newPasswordInput = screen.getByLabelText('New Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
        const submitButtons = screen.getAllByRole('button', { name: 'Update Password' });
        const submitButton = submitButtons[0];

        fireEvent.change(newPasswordInput, { target: { value: 'new-secret-123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'new-secret-123' } });
        fireEvent.click(submitButton);

        expect(mutateMock).toHaveBeenCalled();
    });
});
