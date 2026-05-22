import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhitelistManagementView } from './whitelist-management-view';
import {
    useInstitutionsQuery,
    useDepartmentsQuery,
    useCoursesQuery,
    useStudentWhitelistQuery,
} from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useInstitutionsQuery: vi.fn(),
    useDepartmentsQuery: vi.fn(),
    useCoursesQuery: vi.fn(),
    useStudentWhitelistQuery: vi.fn(),
    useDebounce: vi.fn((val) => val),
    useStableValue: vi.fn((fn) => fn()),
    useDeleteSelectedStudentWhitelistMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('@/hooks', () => ({
    useInstitutionFacet: vi.fn().mockReturnValue([]),
    useDataTableFilterSync: vi.fn(),
}));

// Mock Dialogs to render text labels for assertions
vi.mock('../dialogs/add-student-whitelist-dialog', () => ({
    AddStudentWhitelistDialog: ({
        triggerLabel = 'Add Whitelist Entry',
    }: {
        triggerLabel?: string;
    }) => <div data-testid="mock-add-dialog">{triggerLabel}</div>,
}));
vi.mock('../dialogs/bulk-import-student-whitelist-dialog', () => ({
    BulkImportStudentWhitelistDialog: () => <div data-testid="mock-bulk-dialog">Bulk Import</div>,
}));

describe('WhitelistManagementView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useInstitutionsQuery as any).mockReturnValue({ data: [] });
        (useDepartmentsQuery as any).mockReturnValue({ data: [] });
        (useCoursesQuery as any).mockReturnValue({ data: [] });
        (useStudentWhitelistQuery as any).mockReturnValue({ data: [], isLoading: false });
    });

    it('renders the page header and dialog triggers', () => {
        render(<WhitelistManagementView />);
        expect(screen.getByText(/Support Whitelist Management/i)).toBeDefined();
        expect(screen.getByText(/Bulk Import/i)).toBeDefined();
        expect(screen.getByText(/Add Whitelist/i)).toBeDefined();
    });
});
