import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBulkImportDialogState } from './use-bulk-import-dialog-state';

const {
    mockUseInstitutionsQuery,
    mockUseDepartmentsQuery,
    mockUseCoursesQuery,
    mockUseStableValue,
    mockUseStudentWhitelistBulkImport,
    mockUseStudentWhitelistScope,
} = vi.hoisted(() => ({
    mockUseInstitutionsQuery: vi.fn(),
    mockUseDepartmentsQuery: vi.fn(),
    mockUseCoursesQuery: vi.fn(),
    mockUseStableValue: vi.fn(),
    mockUseStudentWhitelistBulkImport: vi.fn(),
    mockUseStudentWhitelistScope: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useInstitutionsQuery: mockUseInstitutionsQuery,
    useDepartmentsQuery: mockUseDepartmentsQuery,
    useCoursesQuery: mockUseCoursesQuery,
    useStableValue: mockUseStableValue,
}));

vi.mock(
    '@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-bulk-import',
    () => ({
        useStudentWhitelistBulkImport: mockUseStudentWhitelistBulkImport,
    }),
);

vi.mock('@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-scope', () => ({
    useStudentWhitelistScope: mockUseStudentWhitelistScope,
}));

describe('useBulkImportDialogState', () => {
    const mockResetState = vi.fn();
    const mockImportRows = vi.fn();
    const mockParseFile = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseStableValue.mockImplementation((factory: () => unknown) => factory());

        mockUseInstitutionsQuery.mockReturnValue({ data: [] });
        mockUseDepartmentsQuery.mockReturnValue({ data: [] });
        mockUseCoursesQuery.mockReturnValue({ data: [] });

        mockUseStudentWhitelistScope.mockReturnValue({
            isSuperadmin: true,
            lockedInstitutionId: '',
            lockedInstitutionName: '',
            lockedDepartmentId: '',
            lockedCourseId: '',
        });

        mockUseStudentWhitelistBulkImport.mockReturnValue({
            file: null,
            parseResult: null,
            previewCount: 0,
            importSummary: null,
            isParsing: false,
            isImporting: false,
            parseFile: mockParseFile,
            importRows: mockImportRows,
            resetState: mockResetState,
        });
    });

    it('initializes with default states', () => {
        const { result } = renderHook(() => useBulkImportDialogState());

        expect(result.current.open).toBe(false);
        expect(result.current.isDragActive).toBe(false);
        expect(result.current.institutionId).toBe('');
        expect(result.current.departmentId).toBe('');
        expect(result.current.courseId).toBe('');
        expect(result.current.isScopeReady).toBe(false);
    });

    it('toggles open state and resets on close', () => {
        const { result } = renderHook(() => useBulkImportDialogState());

        act(() => {
            result.current.handleOpenChange(true);
        });
        expect(result.current.open).toBe(true);

        act(() => {
            result.current.handleOpenChange(false);
        });
        expect(result.current.open).toBe(false);
        expect(mockResetState).toHaveBeenCalledTimes(1);
    });

    it('updates institution, department, and course selection', () => {
        const { result } = renderHook(() => useBulkImportDialogState());

        act(() => {
            result.current.setInstitutionId('inst-123');
            result.current.setDepartmentId('dept-456');
            result.current.setCourseId('course-789');
        });

        expect(result.current.institutionId).toBe('inst-123');
        expect(result.current.departmentId).toBe('dept-456');
        expect(result.current.courseId).toBe('course-789');
        expect(result.current.isScopeReady).toBe(true);
    });

    it('runs import and closes dialog on success', async () => {
        mockImportRows.mockResolvedValue(true);
        const { result } = renderHook(() => useBulkImportDialogState());

        act(() => {
            result.current.handleOpenChange(true);
            result.current.setInstitutionId('inst-123');
            result.current.setDepartmentId('dept-456');
            result.current.setCourseId('course-789');
        });

        await act(async () => {
            await result.current.handleImport();
        });

        expect(mockImportRows).toHaveBeenCalledWith({
            institution_id: 'inst-123',
            department_id: 'dept-456',
            course_id: 'course-789',
        });
        expect(result.current.open).toBe(false);
    });
});
