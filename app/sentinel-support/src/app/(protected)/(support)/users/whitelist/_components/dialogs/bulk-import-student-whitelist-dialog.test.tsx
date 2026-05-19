import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BulkImportStudentWhitelistDialog } from './bulk-import-student-whitelist-dialog';

vi.mock('./bulk-import/hooks/use-bulk-import-dialog-state', () => ({
    useBulkImportDialogState: () => ({
        open: false,
        isDragActive: false,
        institutionId: '',
        setInstitutionId: vi.fn(),
        activeInstitutionId: '',
        lockedInstitutionName: '',
        canSelectInstitution: true,
        lockedDepartmentId: '',
        activeDepartmentId: '',
        setDepartmentId: vi.fn(),
        availableDepartments: [],
        lockedCourseId: '',
        activeCourseId: '',
        setCourseId: vi.fn(),
        availableCourses: [],
        isScopeReady: false,
        file: null,
        parseResult: null,
        previewCount: 0,
        importSummary: null,
        isParsing: false,
        isImporting: false,
        showsSourceCourse: false,
        hasImportSummary: false,
        visibleIssues: [],
        previewRows: [],
        visiblePreviewRows: [],
        hiddenPreviewRowCount: 0,
        handleOpenChange: vi.fn(),
        handleFileChange: vi.fn(),
        handleImport: vi.fn(),
        handleDragOver: vi.fn(),
        handleDragLeave: vi.fn(),
        handleDrop: vi.fn(),
        resetState: vi.fn(),
        institutions: [],
    }),
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
