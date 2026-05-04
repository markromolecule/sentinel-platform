import { SYSTEM_ROLE_ORDER } from '@sentinel/shared/constants';
import type { AccessControlRole } from '@sentinel/shared/types';
import { ACTION_SORT_ORDER, CATEGORY_SORT_ORDER, MODULE_SORT_ORDER } from './constants';

export function getActionSortIndex(actionKey: string) {
    const index = ACTION_SORT_ORDER.indexOf(actionKey as (typeof ACTION_SORT_ORDER)[number]);
    return index === -1 ? ACTION_SORT_ORDER.length : index;
}

export function getModuleSortIndex(moduleKey: string) {
    const index = MODULE_SORT_ORDER.indexOf(moduleKey as (typeof MODULE_SORT_ORDER)[number]);
    return index === -1 ? MODULE_SORT_ORDER.length : index;
}

export function getPermissionCategorySortIndex(categoryKey: string | null | undefined) {
    if (!categoryKey) return CATEGORY_SORT_ORDER.length;

    const index = CATEGORY_SORT_ORDER.indexOf(categoryKey);
    return index === -1 ? CATEGORY_SORT_ORDER.length : index;
}

export function sortRolesForReview(roles: AccessControlRole[]) {
    const orderMap = new Map<string, number>(
        SYSTEM_ROLE_ORDER.map((roleName, index) => [roleName, index]),
    );

    return [...roles].sort((left, right) => {
        const leftIndex = orderMap.get(left.name);
        const rightIndex = orderMap.get(right.name);

        if (leftIndex !== undefined && rightIndex !== undefined) {
            return leftIndex - rightIndex;
        }

        if (leftIndex !== undefined) return -1;
        if (rightIndex !== undefined) return 1;

        if (left.isSystem !== right.isSystem) {
            return left.isSystem ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
    });
}
