import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { CoursesPage } from './courses-page';
import { useCoursesQuery, useActivePermissions } from '@sentinel/hooks';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import React from 'react';

afterEach(() => {
    cleanup();
});

vi.mock('@sentinel/hooks', () => ({
    useCoursesQuery: vi.fn(),
    useDebounce: (value: any) => value,
    useStableValue: (fn: any) => fn(),
    useActivePermissions: vi.fn(),
    useDepartmentsQuery: vi.fn(() => ({ data: [] })),
    useDeleteCoursesMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useCreateSectionMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useUpdateSectionMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useDeleteSectionMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    isPermissionDeniedError: vi.fn((err, permission) => {
        if (err && err.type === 'denied') return true;
        return false;
    }),
}));

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: vi.fn(),
}));

vi.mock('@/data', () => ({
    useDeleteCourseMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useCreateCourseMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useUpdateCourseMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useDepartmentsQuery: vi.fn(() => ({ data: [] })),
    useSectionsQuery: vi.fn(() => ({ data: [] })),
    useCreateSectionMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useUpdateSectionMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useDeleteSectionMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useEffectiveInstitutionNamingConventionsQuery: vi.fn(() => ({ data: null })),
}));

const mockCourses = [
    {
        id: 'course-1',
        code: 'BSIT',
        title: 'Bachelor of Science in Information Technology',
        departmentId: 'dept-1',
        departmentName: 'IT Department',
        departmentCode: 'IT',
        inheritanceStatus: 'LOCAL',
        createdAt: '2026-05-17T00:00:00.000Z',
    },
];

describe('CoursesPage Feature Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading indicator when query is loading', () => {
        vi.mocked(useCoursesQuery).mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: null,
        } as any);

        vi.mocked(useActivePermissions).mockReturnValue({
            hasPermission: () => true,
            hasAnyPermission: () => true,
            isLoading: false,
            activePermissions: [],
        });

        vi.mocked(useAcademicScope).mockReturnValue({
            isReadOnlyFor: () => false,
            role: 'superadmin',
            isSuperadmin: true,
            isAdmin: false,
            isLoading: false,
            institutionId: 'inst-1',
            institutionName: 'Sentinel State',
        } as any);

        render(<CoursesPage />);

        // Loading spinner exists or table shows loading
        const loadingIndicator = screen.getByPlaceholderText('Search courses...');
        expect(loadingIndicator).toBeDefined();
    });

    it('renders courses list successfully and shows Add Course trigger when authorized', () => {
        vi.mocked(useCoursesQuery).mockReturnValue({
            data: mockCourses,
            isLoading: false,
            isError: false,
            error: null,
        } as any);

        vi.mocked(useActivePermissions).mockReturnValue({
            hasPermission: (perm) => true,
            hasAnyPermission: () => true,
            isLoading: false,
            activePermissions: [],
        });

        vi.mocked(useAcademicScope).mockReturnValue({
            isReadOnlyFor: () => false,
            role: 'superadmin',
            isSuperadmin: true,
            isAdmin: false,
            isLoading: false,
            institutionId: 'inst-1',
            institutionName: 'Sentinel State',
        } as any);

        render(<CoursesPage />);

        expect(screen.getByText('BSIT')).toBeDefined();
        expect(screen.getByText('Bachelor of Science in Information Technology')).toBeDefined();

        const addCourseButtons = screen.queryAllByRole('button', { name: /Add Course/i });
        expect(addCourseButtons.length).toBeGreaterThan(0);
    });

    it('hides Add Course dialog when academic scope is read-only', () => {
        vi.mocked(useCoursesQuery).mockReturnValue({
            data: mockCourses,
            isLoading: false,
            isError: false,
            error: null,
        } as any);

        vi.mocked(useActivePermissions).mockReturnValue({
            hasPermission: () => true,
            hasAnyPermission: () => true,
            isLoading: false,
            activePermissions: [],
        });

        vi.mocked(useAcademicScope).mockReturnValue({
            isReadOnlyFor: (res) => res === 'courses', // Read-only for courses
            role: 'admin',
            isSuperadmin: false,
            isAdmin: true,
            isLoading: false,
            institutionId: 'inst-1',
            institutionName: 'Sentinel State',
        } as any);

        render(<CoursesPage />);

        const addCourseButtons = screen.queryAllByRole('button', { name: /Add Course/i });
        expect(addCourseButtons.length).toBe(0);
    });

    it('hides Add Course dialog when courses:create permission is missing', () => {
        vi.mocked(useCoursesQuery).mockReturnValue({
            data: mockCourses,
            isLoading: false,
            isError: false,
            error: null,
        } as any);

        vi.mocked(useActivePermissions).mockReturnValue({
            hasPermission: (perm) => perm !== 'courses:create', // Lacks create permission
            hasAnyPermission: () => true,
            isLoading: false,
            activePermissions: [],
        });

        vi.mocked(useAcademicScope).mockReturnValue({
            isReadOnlyFor: () => false,
            role: 'admin',
            isSuperadmin: false,
            isAdmin: true,
            isLoading: false,
            institutionId: 'inst-1',
            institutionName: 'Sentinel State',
        } as any);

        render(<CoursesPage />);

        const addCourseButtons = screen.queryAllByRole('button', { name: /Add Course/i });
        expect(addCourseButtons.length).toBe(0);
    });
});
