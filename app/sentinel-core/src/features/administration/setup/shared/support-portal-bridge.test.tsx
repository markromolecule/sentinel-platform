import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupportPortalBridge } from './support-portal-bridge';

const mockUseAcademicScope = vi.fn();
const mockUseCoreAdminCapabilities = vi.fn();

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => mockUseAcademicScope(),
}));

vi.mock('@/hooks/use-core-admin-capabilities', () => ({
    useCoreAdminCapabilities: () => mockUseCoreAdminCapabilities(),
}));

vi.mock('@/lib/support-portal', () => ({
    getSupportPortalUrl: () => 'http://mock-support-portal.test',
}));

describe('SupportPortalBridge', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state when capabilities are loading', () => {
        mockUseAcademicScope.mockReturnValue({
            isReadOnlyFor: () => true,
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
            isLoading: true,
        });

        const { container } = render(
            <SupportPortalBridge
                title="Institutions Setup"
                description="Configure institutions"
                resourceKey="institutions"
            />
        );

        expect(container.querySelector('.animate-spin')).toBeTruthy();
    });

    it('renders access denied state if the user lacks view permission', () => {
        mockUseAcademicScope.mockReturnValue({
            isReadOnlyFor: () => true,
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => false,
            isLoading: false,
        });

        render(
            <SupportPortalBridge
                title="Institutions Setup"
                description="Configure institutions"
                resourceKey="institutions"
            />
        );

        expect(screen.getByText('Access Denied')).toBeTruthy();
        expect(screen.getByText(/You do not have the required permissions to view this resource/i)).toBeTruthy();
    });

    it('renders read-only mode if the user is in read-only mode for this resource', () => {
        mockUseAcademicScope.mockReturnValue({
            isReadOnlyFor: () => true,
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
            isLoading: false,
        });

        render(
            <SupportPortalBridge
                title="Institutions Setup"
                description="Configure institutions"
                resourceKey="institutions"
            />
        );

        expect(screen.getByText('Institutions Setup')).toBeTruthy();
        expect(screen.getByText('Read-Only Access Mode')).toBeTruthy();
        expect(screen.getByText(/You are authorized with read-only capabilities/i)).toBeTruthy();
        expect(screen.getByText('View in Support Portal')).toBeTruthy();
        
        const anchor = screen.getByRole('link', { name: /View in Support Portal/i });
        expect(anchor.getAttribute('href')).toBe('http://mock-support-portal.test/institutions');
    });

    it('renders management mode if the user is not in read-only mode (e.g., editable)', () => {
        mockUseAcademicScope.mockReturnValue({
            isReadOnlyFor: () => false,
        });
        mockUseCoreAdminCapabilities.mockReturnValue({
            canViewPage: () => true,
            isLoading: false,
        });

        render(
            <SupportPortalBridge
                title="Departments Setup"
                description="Manage departments"
                resourceKey="departments"
            />
        );

        expect(screen.getByText('Departments Setup')).toBeTruthy();
        expect(screen.getByText('Management Access Mode')).toBeTruthy();
        expect(screen.getByText(/You are authorized with active management privileges/i)).toBeTruthy();
        expect(screen.getByText('Open Support Portal Manager')).toBeTruthy();
        
        const anchor = screen.getByRole('link', { name: /Open Support Portal Manager/i });
        expect(anchor.getAttribute('href')).toBe('http://mock-support-portal.test/departments');
    });
});
