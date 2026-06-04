import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentWhitelistScope } from './use-student-whitelist-scope';

const mockUseUser = vi.fn();
const mockUseUserQuery = vi.fn();

vi.mock('@/hooks/use-user', () => ({
    useUser: () => mockUseUser(),
}));

vi.mock('@sentinel/hooks', () => ({
    useUserQuery: (id: string) => mockUseUserQuery(id),
}));

describe('useStudentWhitelistScope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('resolves superadmin scope correctly', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'superadmin-1', role: 'superadmin' },
            isLoading: false,
        });
        mockUseUserQuery.mockReturnValue({
            data: {
                id: 'superadmin-1',
                institutionId: '',
                institution: '',
                departmentId: '',
                courseId: '',
            },
            isLoading: false,
        });

        const { result } = renderHook(() => useStudentWhitelistScope());

        expect(result.current.isSuperadmin).toBe(true);
        expect(result.current.lockedInstitutionId).toBe('');
        expect(result.current.lockedInstitutionName).toBe('');
        expect(result.current.lockedDepartmentId).toBe('');
        expect(result.current.lockedCourseId).toBe('');
    });

    it('resolves regular admin scope with locked institution and department', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'admin-1', role: 'admin' },
            isLoading: false,
        });
        mockUseUserQuery.mockReturnValue({
            data: {
                id: 'admin-1',
                institutionId: 'inst-123',
                institution: 'Test Institution',
                departmentId: 'dept-456',
                courseId: 'course-789',
            },
            isLoading: false,
        });

        const { result } = renderHook(() => useStudentWhitelistScope());

        expect(result.current.isSuperadmin).toBe(false);
        expect(result.current.lockedInstitutionId).toBe('inst-123');
        expect(result.current.lockedInstitutionName).toBe('Test Institution');
        expect(result.current.lockedDepartmentId).toBe('dept-456');
        expect(result.current.lockedCourseId).toBe('course-789');
    });
});
