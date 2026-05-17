import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentWhitelistBulkImport } from './use-student-whitelist-bulk-import';

const { mockUseApi, mockUseStableValue, mockBulkImportStudentWhitelist } = vi.hoisted(() => ({
    mockUseApi: vi.fn(),
    mockUseStableValue: vi.fn(),
    mockBulkImportStudentWhitelist: vi.fn(),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: mockUseApi,
    useStableValue: mockUseStableValue,
}));

vi.mock('@sentinel/services', () => ({
    bulkImportStudentWhitelist: mockBulkImportStudentWhitelist,
}));

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: vi.fn(),
    }),
}));

vi.mock('xlsx', () => ({
    read: vi.fn().mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
            Sheet1: {},
        },
    }),
    utils: {
        sheet_to_json: vi.fn().mockReturnValue([
            ['Student ID', 'Last Name', 'First Name', 'Status'],
            ['2024-00001', 'Dela Cruz', 'Juan', 'Active'],
        ]),
    },
}));

describe('useStudentWhitelistBulkImport', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseStableValue.mockImplementation((factory: () => unknown) => factory());
        mockUseApi.mockReturnValue({});
    });

    it('initializes with default state values', () => {
        const { result } = renderHook(() => useStudentWhitelistBulkImport());

        expect(result.current.file).toBeNull();
        expect(result.current.parseResult).toBeNull();
        expect(result.current.isParsing).toBe(false);
        expect(result.current.isImporting).toBe(false);
    });

    it('parses a selected spreadsheet file successfully', async () => {
        const { result } = renderHook(() => useStudentWhitelistBulkImport());
        const fakeFile = new File([''], 'whitelist.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fakeFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));

        await act(async () => {
            await result.current.parseFile(fakeFile);
        });

        expect(result.current.file).toBe(fakeFile);
        expect(result.current.parseResult).not.toBeNull();
        expect(result.current.parseResult?.rows).toHaveLength(1);
        expect(result.current.parseResult?.rows[0]).toEqual(
            expect.objectContaining({
                student_number: '2024-00001',
                last_name: 'Dela Cruz',
                first_name: 'Juan',
                status: 'ACTIVE',
            }),
        );
    });

    it('sends rows to the bulk import API', async () => {
        const { result } = renderHook(() => useStudentWhitelistBulkImport());
        const fakeFile = new File([''], 'whitelist.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fakeFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));

        mockBulkImportStudentWhitelist.mockResolvedValue({
            createdCount: 1,
            failedCount: 0,
            failures: [],
        });

        await act(async () => {
            await result.current.parseFile(fakeFile);
        });

        let success = false;
        await act(async () => {
            success = await result.current.importRows({
                institution_id: 'inst-123',
                department_id: 'dept-123',
                course_id: 'course-123',
            });
        });

        expect(success).toBe(true);
        expect(mockBulkImportStudentWhitelist).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                institution_id: 'inst-123',
                department_id: 'dept-123',
                course_id: 'course-123',
                rows: expect.any(Array),
            }),
        );
    });
});
