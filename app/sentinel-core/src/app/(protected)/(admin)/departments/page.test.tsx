import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminDepartmentsPage from './page';

vi.mock('@/features/administration/setup/departments/departments-page', () => ({
    DepartmentsPage: () => <div data-testid="departments-page">Departments Setup Page</div>,
}));

describe('AdminDepartmentsPage Route Smoke Test', () => {
    it('renders without throwing and mounts the departments setup page', () => {
        render(<AdminDepartmentsPage />);
        expect(screen.getByTestId('departments-page')).toBeTruthy();
    });
});
