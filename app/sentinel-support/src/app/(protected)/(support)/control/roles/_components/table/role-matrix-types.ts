import type { AccessControlPermission, AccessControlRole } from '@sentinel/shared/types';

export interface MatrixModule {
    moduleKey: string;
    moduleLabel: string;
    helperText: string;
    permissions: AccessControlPermission[];
}

export interface MatrixCategory {
    categoryKey: string | null;
    categoryLabel: string;
    modules: MatrixModule[];
}

export interface RoleMatrixBaseProps {
    sortedRoles: AccessControlRole[];
    draftPermissionIdsByRoleId: Record<number, string[]>;
    savingRoleIds: number[];
}
