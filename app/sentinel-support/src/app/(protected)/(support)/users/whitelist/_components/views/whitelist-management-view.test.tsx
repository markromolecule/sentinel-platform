import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhitelistManagementView } from './whitelist-management-view';
import { 
    useInstitutionsQuery, 
    useDepartmentsQuery, 
    useCoursesQuery, 
    useStudentWhitelistQuery 
} from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useInstitutionsQuery: vi.fn(),
    useDepartmentsQuery: vi.fn(),
    useCoursesQuery: vi.fn(),
    useStudentWhitelistQuery: vi.fn(),
    useDebounce: vi.fn((val) => val),
    useStableValue: vi.fn((fn) => fn()),
}));

describe('WhitelistManagementView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useInstitutionsQuery as any).mockReturnValue({ data: [] });
        (useDepartmentsQuery as any).mockReturnValue({ data: [] });
        (useCoursesQuery as any).mockReturnValue({ data: [] });
        (useStudentWhitelistQuery as any).mockReturnValue({ data: [], isLoading: false });
    });

    it('renders the page header', () => {
        render(<WhitelistManagementView />);
        expect(screen.getByText(/Support Whitelist Management/i)).toBeDefined();
    });
});
