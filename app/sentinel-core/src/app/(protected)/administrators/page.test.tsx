import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SuperadminAdministratorsPage from './page';

vi.mock('@/data/supabase/client', () => ({
    createSupabaseClient: () => ({}),
}));

vi.mock('@/features/administration/users/user-management-page', () => ({
    UserManagementPage: ({ title }: { title: string }) => (
        <div data-testid="user-management-page">{title}</div>
    ),
}));

describe('SuperadminAdministratorsPage Route Smoke Test', () => {
    it('renders without throwing and mounts the user management page component', () => {
        render(<SuperadminAdministratorsPage />);
        expect(screen.getByTestId('user-management-page')).toBeTruthy();
        expect(screen.getByText('Administrator Management')).toBeTruthy();
    });
});
