'use client';

import { useActivePermissions } from '@sentinel/hooks';
import { useMemo } from 'react';
import {
    type CoreAdminPageId,
    type CoreAdminPageCapability,
    CORE_ADMIN_PAGE_CAPABILITIES,
    findCoreAdminPageCapabilityByPath,
    getCoreAdminPageCapability,
    isRoleEligibleForCoreAdminPage,
} from '@/lib/authorization/core-admin-capability-map';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useUser } from '@/hooks/use-user';
import { getCoreAdminNavigationSections } from '@/components/sidebar/common/core-admin-nav-config';

function matchesAnyPermission(activePermissionKeys: string[], requiredPermissionKeys: string[]) {
    if (requiredPermissionKeys.length === 0) {
        return true;
    }

    return requiredPermissionKeys.some((permissionKey) =>
        activePermissionKeys.includes(permissionKey),
    );
}

/**
 * Provides centralized page and navigation capability helpers for the core admin shell.
 */
export function useCoreAdminCapabilities() {
    const { data: user, isLoading: isLoadingUser } = useUser();
    const academicScope = useAcademicScope();
    const {
        activePermissionKeys,
        hasAnyPermission: hasGrantedPermission,
        isLoading: isLoadingPermissions,
    } = useActivePermissions();

    const role = user?.role ?? null;

    const canViewPage = useMemo(
        () => (pageId: CoreAdminPageId) => {
            if (!isRoleEligibleForCoreAdminPage(pageId, role)) {
                return false;
            }

            return matchesAnyPermission(
                activePermissionKeys,
                getCoreAdminPageCapability(pageId).requiredViewPermissions,
            );
        },
        [activePermissionKeys, role],
    );

    const canEditPage = useMemo(
        () => (pageId: CoreAdminPageId) => {
            if (!canViewPage(pageId)) {
                return false;
            }

            return hasGrantedPermission(
                getCoreAdminPageCapability(pageId).requiredActionPermissions,
            );
        },
        [canViewPage, hasGrantedPermission],
    );

    const visibleNavigationSections = useMemo(
        () => getCoreAdminNavigationSections({ canViewPage }),
        [canViewPage],
    );

    const accessiblePages = useMemo(
        () => Object.values(CORE_ADMIN_PAGE_CAPABILITIES).filter((page) => canViewPage(page.id)),
        [canViewPage],
    );

    const getPageCapability = useMemo(
        () => (pageId: CoreAdminPageId) => ({
            ...getCoreAdminPageCapability(pageId),
            canView: canViewPage(pageId),
            canEdit: canEditPage(pageId),
        }),
        [canEditPage, canViewPage],
    );

    const getPageCapabilityByPath = useMemo(
        () => (pathname: string) => {
            const page = findCoreAdminPageCapabilityByPath(pathname);

            if (!page) {
                return null;
            }

            return {
                ...page,
                canView: canViewPage(page.id),
                canEdit: canEditPage(page.id),
            };
        },
        [canEditPage, canViewPage],
    );

    return {
        role,
        activePermissionKeys,
        currentPageCapability: getPageCapabilityByPath,
        accessiblePages,
        visibleNavigationSections,
        canViewPage,
        canEditPage,
        getPageCapability,
        isLoading: isLoadingUser || isLoadingPermissions || academicScope.isLoading,
        isAdmin: academicScope.isAdmin,
        isSuperadmin: academicScope.isSuperadmin,
        institutionId: academicScope.institutionId,
        assignedDepartmentId: academicScope.assignedDepartmentId,
        assignedCourseId: academicScope.assignedCourseId,
    };
}

export type CoreAdminResolvedPageCapability = CoreAdminPageCapability & {
    canView: boolean;
    canEdit: boolean;
};
