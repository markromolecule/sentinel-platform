import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CoreSemestersPage from './page';

vi.mock('@sentinel/hooks', () => ({
    useDebounce: (value: string) => value,
    useSemestersQuery: () => ({
        data: [
            { id: '1', academicYear: '2025-2026', semester: '1st Semester', status: 'Active', isInherited: false }
        ],
        isLoading: false,
        isError: false,
        error: null,
    }),
    isPermissionDeniedError: () => false,
}));

vi.mock('@/app/(protected)/semesters/_components', () => ({
    AddSemesterDialog: () => <div data-testid="add-dialog">Add Dialog</div>,
    SemestersList: ({ semesters }: { semesters: any[] }) => (
        <div data-testid="semesters-list">
            Semesters: {semesters.map(s => `${s.academicYear} - ${s.semester}`).join(', ')}
        </div>
    ),
}));

vi.mock('@sentinel/ui', () => ({
    PageHeader: ({ children, title }: any) => (
        <div data-testid="page-header">
            <h1>{title}</h1>
            {children}
        </div>
    ),
    PermissionDeniedState: () => <div data-testid="permission-denied">Access Denied</div>,
    Separator: () => <hr />,
}));

describe('CoreSemestersPage Route Smoke Test', () => {
    it('renders without throwing and mounts the semesters page layout', () => {
        render(<CoreSemestersPage />);
        expect(screen.getByText('Semester Management')).toBeTruthy();
        expect(screen.getByTestId('semesters-list')).toBeTruthy();
        expect(screen.getByText('Semesters: 2025-2026 - 1st Semester')).toBeTruthy();
    });
});
