import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BulkImportStudentWhitelistDialog } from './bulk-import-student-whitelist-dialog';

vi.mock('@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-bulk-import', () => ({
    useStudentWhitelistBulkImport: () => ({
        file: null,
        parseResult: null,
        previewCount: 0,
        importSummary: null,
        isParsing: false,
        isImporting: false,
        parseFile: vi.fn(),
        importRows: vi.fn(),
        resetState: vi.fn(),
    }),
}));

vi.mock('@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-scope', () => ({
    useStudentWhitelistScope: () => ({
        isSuperadmin: true,
        lockedInstitutionId: '',
        lockedInstitutionName: '',
        lockedDepartmentId: '',
        lockedCourseId: '',
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useInstitutionsQuery: () => ({ data: [] }),
    useDepartmentsQuery: () => ({ data: [] }),
    useCoursesQuery: () => ({ data: [] }),
    useStableValue: (factory: () => unknown) => factory(),
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    return {
        ...actual,
        Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
            <div data-testid="mock-dialog" data-open={open}>
                {children}
            </div>
        ),
        DialogContent: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="mock-dialog-content">{children}</div>
        ),
        DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };
});

describe('BulkImportStudentWhitelistDialog', () => {
    it('renders the dialog trigger correctly', () => {
        render(<BulkImportStudentWhitelistDialog />);

        expect(screen.getByText('Bulk Import')).toBeTruthy();
    });
});
