import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCoreAdminCapabilities } from './use-core-admin-capabilities';

const mockUseUser = vi.fn();
const mockUseAcademicScope = vi.fn();
const mockUseActivePermissions = vi.fn();

vi.mock('@/hooks/use-user', () => ({
    useUser: () => mockUseUser(),
}));

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: () => mockUseAcademicScope(),
}));

vi.mock('@sentinel/hooks', () => ({
    useActivePermissions: () => mockUseActivePermissions(),
}));

function buildPermissionState(activePermissionKeys: string[]) {
    return {
        activePermissionKeys,
        hasPermission: (permissionKey: string) => activePermissionKeys.includes(permissionKey),
        hasAnyPermission: (permissionKeys: string[]) =>
            permissionKeys.some((permissionKey) => activePermissionKeys.includes(permissionKey)),
        hasAllPermissions: (permissionKeys: string[]) =>
            permissionKeys.every((permissionKey) => activePermissionKeys.includes(permissionKey)),
        isLoading: false,
    };
}

describe('useCoreAdminCapabilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('exposes admin-only navigation when the admin has matching permissions', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'admin-1', role: 'admin' },
            isLoading: false,
        });
        mockUseAcademicScope.mockReturnValue({
            role: 'admin',
            authUser: { id: 'admin-1', role: 'admin' },
            currentProfile: null,
            isSuperadmin: false,
            isAdmin: true,
            isLoading: false,
            institutionId: 'institution-1',
            institutionName: 'Sentinel State',
            assignedDepartmentId: 'department-1',
            assignedCourseId: 'course-1',
            shouldLockDepartment: true,
            shouldLockCourse: true,
        });
        mockUseActivePermissions.mockReturnValue(
            buildPermissionState([
                'dashboard:view',
                'sections:view',
                'subjects:view',
                'subject_offerings:view',
                'users:view',
            ]),
        );

        const { result } = renderHook(() => useCoreAdminCapabilities());

        expect(result.current.canViewPage('sections')).toBe(true);
        expect(result.current.canViewPage('administrators')).toBe(false);
        expect(result.current.canEditPage('sections')).toBe(false);

        const itemTitles = result.current.visibleNavigationSections.flatMap((section) =>
            section.items.map((item) => item.title),
        );

        expect(itemTitles).toContain('Sections');
        expect(itemTitles).toContain('Users');
        expect(itemTitles).not.toContain('Identity & Access');
    });

    it('exposes superadmin access-management navigation with the expected sub-items', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'superadmin-1', role: 'superadmin' },
            isLoading: false,
        });
        mockUseAcademicScope.mockReturnValue({
            role: 'superadmin',
            authUser: { id: 'superadmin-1', role: 'superadmin' },
            currentProfile: null,
            isSuperadmin: true,
            isAdmin: false,
            isLoading: false,
            institutionId: 'institution-1',
            institutionName: 'Sentinel State',
            assignedDepartmentId: '',
            assignedCourseId: '',
            shouldLockDepartment: false,
            shouldLockCourse: false,
        });
        mockUseActivePermissions.mockReturnValue(
            buildPermissionState([
                'dashboard:view',
                'subjects:view',
                'subject_offerings:view',
                'users:view',
                'courses:view',
                'access_control:view',
                'access_control:manage_roles',
            ]),
        );

        const { result } = renderHook(() => useCoreAdminCapabilities());

        expect(result.current.canViewPage('permissions')).toBe(true);
        expect(result.current.canEditPage('permissions')).toBe(true);
        expect(result.current.canViewPage('users')).toBe(false);

        const accessManagementItem = result.current.visibleNavigationSections
            .flatMap((section) => section.items)
            .find((item) => item.title === 'Identity & Access');

        expect(accessManagementItem?.subItems?.map((item) => item.title)).toEqual([
            'Administrators',
            'Whitelist',
            'Permissions',
        ]);
    });

    it('hides permission-gated pages when the user does not have the required permissions', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'admin-2', role: 'admin' },
            isLoading: false,
        });
        mockUseAcademicScope.mockReturnValue({
            role: 'admin',
            authUser: { id: 'admin-2', role: 'admin' },
            currentProfile: null,
            isSuperadmin: false,
            isAdmin: true,
            isLoading: false,
            institutionId: 'institution-1',
            institutionName: 'Sentinel State',
            assignedDepartmentId: 'department-1',
            assignedCourseId: 'course-1',
            shouldLockDepartment: true,
            shouldLockCourse: true,
        });
        mockUseActivePermissions.mockReturnValue(buildPermissionState(['dashboard:view']));

        const { result } = renderHook(() => useCoreAdminCapabilities());

        expect(result.current.canViewPage('sections')).toBe(false);
        expect(result.current.canViewPage('subjects')).toBe(false);
        expect(result.current.canViewPage('users')).toBe(false);

        const itemTitles = result.current.visibleNavigationSections.flatMap((section) =>
            section.items.map((item) => item.title),
        );

        expect(itemTitles).toContain('Overview');
        expect(itemTitles).not.toContain('Sections');
        expect(itemTitles).not.toContain('Users');
    });

    it('allows admin role to view courses with matching view permission but restricts edit rights by default', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'admin-3', role: 'admin' },
            isLoading: false,
        });
        mockUseAcademicScope.mockReturnValue({
            role: 'admin',
            authUser: { id: 'admin-3', role: 'admin' },
            currentProfile: null,
            isSuperadmin: false,
            isAdmin: true,
            isLoading: false,
            institutionId: 'institution-1',
            institutionName: 'Sentinel State',
            assignedDepartmentId: 'department-1',
            assignedCourseId: 'course-1',
            shouldLockDepartment: true,
            shouldLockCourse: true,
        });
        mockUseActivePermissions.mockReturnValue(
            buildPermissionState(['dashboard:view', 'courses:view']),
        );

        const { result } = renderHook(() => useCoreAdminCapabilities());

        expect(result.current.canViewPage('courses')).toBe(true);
        expect(result.current.canEditPage('courses')).toBe(false);
    });

    it('allows admin role full courses management when assigned all courses action permissions', () => {
        mockUseUser.mockReturnValue({
            data: { id: 'admin-4', role: 'admin' },
            isLoading: false,
        });
        mockUseAcademicScope.mockReturnValue({
            role: 'admin',
            authUser: { id: 'admin-4', role: 'admin' },
            currentProfile: null,
            isSuperadmin: false,
            isAdmin: true,
            isLoading: false,
            institutionId: 'institution-1',
            institutionName: 'Sentinel State',
            assignedDepartmentId: 'department-1',
            assignedCourseId: 'course-1',
            shouldLockDepartment: true,
            shouldLockCourse: true,
        });
        mockUseActivePermissions.mockReturnValue(
            buildPermissionState([
                'dashboard:view',
                'courses:view',
                'courses:create',
                'courses:update',
                'courses:delete',
            ]),
        );

        const { result } = renderHook(() => useCoreAdminCapabilities());

        expect(result.current.canViewPage('courses')).toBe(true);
        expect(result.current.canEditPage('courses')).toBe(true);
    });
});
