import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminSemestersPage from './page';

vi.mock('@/features/administration/setup/semesters/semesters-page', () => ({
    SemestersPage: () => <div data-testid="semesters-page">Semesters Setup Page</div>,
}));

describe('AdminSemestersPage Route Smoke Test', () => {
    it('renders without throwing and mounts the semesters setup page', () => {
        render(<AdminSemestersPage />);
        expect(screen.getByTestId('semesters-page')).toBeTruthy();
    });
});
