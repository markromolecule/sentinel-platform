import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminInstitutionsPage from './page';

vi.mock('@/features/administration/setup/institutions/institutions-page', () => ({
    InstitutionsPage: () => <div data-testid="institutions-page">Institutions Setup Page</div>,
}));

describe('AdminInstitutionsPage Route Smoke Test', () => {
    it('renders without throwing and mounts the institutions setup page', () => {
        render(<AdminInstitutionsPage />);
        expect(screen.getByTestId('institutions-page')).toBeTruthy();
    });
});
