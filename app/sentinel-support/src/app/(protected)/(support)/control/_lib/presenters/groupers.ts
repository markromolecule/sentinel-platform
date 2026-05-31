import type { AccessControlPermission, AccessControlRole } from '@sentinel/shared/types';
import { SYSTEM_AREAS } from './constants';
import { formatActionLabel, formatModuleLabel, getPermissionCategoryLabel } from './formatters';
import { getActionSortIndex, getModuleSortIndex, getPermissionCategorySortIndex } from './sorters';
import { getModuleHelperText, mapActionKeyToCrudBucket, type CrudBucketKey } from './helpers';

export function groupPermissionsBySystemArea(permissions: AccessControlPermission[]) {
    const uniquePermissions = Array.from(
        new Map(permissions.map((p) => [p.id, p])).values()
    );
    const permissionsByModule = uniquePermissions.reduce<Record<string, AccessControlPermission[]>>(
        (groups, permission) => {
            groups[permission.moduleKey] = [...(groups[permission.moduleKey] || []), permission];
            return groups;
        },
        {},
    );

    return SYSTEM_AREAS.map((area) => ({
        ...area,
        modules: area.moduleKeys
            .map((moduleKey) => {
                const modulePermissions = permissionsByModule[moduleKey] || [];

                if (modulePermissions.length === 0) {
                    return null;
                }

                const buckets: Record<CrudBucketKey, AccessControlPermission[]> = {
                    view: [],
                    create: [],
                    update: [],
                    delete: [],
                };

                for (const permission of modulePermissions) {
                    buckets[mapActionKeyToCrudBucket(permission.actionKey)] = [
                        ...buckets[mapActionKeyToCrudBucket(permission.actionKey)],
                        permission,
                    ];
                }

                return {
                    moduleKey,
                    moduleLabel: formatModuleLabel(moduleKey),
                    helperText: getModuleHelperText(moduleKey),
                    buckets,
                    permissions: modulePermissions,
                };
            })
            .filter((module): module is NonNullable<typeof module> => Boolean(module)),
    })).filter((area) => area.modules.length > 0);
}

export function groupPermissionsByCategoryAndModule(permissions: AccessControlPermission[]) {
    const uniquePermissions = Array.from(
        new Map(permissions.map((p) => [p.id, p])).values()
    );
    const grouped = uniquePermissions.reduce<
        Record<
            string,
            {
                categoryKey: string | null;
                categoryLabel: string;
                modules: Record<string, AccessControlPermission[]>;
            }
        >
    >((categories, permission) => {
        const categoryKey = permission.category?.trim() || null;
        const categoryId = categoryKey ?? '__other__';
        categories[categoryId] = categories[categoryId] || {
            categoryKey,
            categoryLabel: getPermissionCategoryLabel(categoryKey),
            modules: {},
        };
        categories[categoryId].modules[permission.moduleKey] = [
            ...(categories[categoryId].modules[permission.moduleKey] || []),
            permission,
        ];
        return categories;
    }, {});

    return Object.values(grouped)
        .sort(
            (left, right) =>
                getPermissionCategorySortIndex(left.categoryKey) -
                    getPermissionCategorySortIndex(right.categoryKey) ||
                left.categoryLabel.localeCompare(right.categoryLabel),
        )
        .map((category) => ({
            categoryKey: category.categoryKey,
            categoryLabel: category.categoryLabel,
            modules: Object.entries(category.modules)
                .sort(
                    (left, right) =>
                        getModuleSortIndex(left[0]) - getModuleSortIndex(right[0]) ||
                        left[0].localeCompare(right[0]),
                )
                .map(([moduleKey, modulePermissions]) => ({
                    moduleKey,
                    moduleLabel: formatModuleLabel(moduleKey),
                    helperText: getModuleHelperText(moduleKey),
                    permissions: [...modulePermissions].sort((left, right) => {
                        const actionDifference =
                            getActionSortIndex(left.actionKey) -
                            getActionSortIndex(right.actionKey);

                        if (actionDifference !== 0) {
                            return actionDifference;
                        }

                        return (
                            left.actionKey.localeCompare(right.actionKey) ||
                            left.name.localeCompare(right.name)
                        );
                    }),
                })),
        }));
}

export function summarizeRolePermissions(
    role: AccessControlRole,
    permissions: AccessControlPermission[],
) {
    const selectedPermissions = permissions.filter((permission) =>
        role.permissionIds.includes(permission.id),
    );

    if (selectedPermissions.length === 0) {
        return {
            headline: 'No permissions assigned yet',
            lines: ['Use the permission editor to assign the first access group.'],
            moduleCount: 0,
        };
    }

    const modules = selectedPermissions.reduce<Record<string, string[]>>((groups, permission) => {
        groups[permission.moduleKey] = [
            ...(groups[permission.moduleKey] || []),
            permission.actionKey,
        ];
        return groups;
    }, {});

    const lines = Object.entries(modules)
        .map(([moduleKey, actionKeys]) => {
            const uniqueActions = Array.from(new Set(actionKeys)).sort(
                (left, right) =>
                    getActionSortIndex(left) - getActionSortIndex(right) ||
                    left.localeCompare(right),
            );
            return `${formatModuleLabel(moduleKey)}: ${uniqueActions
                .map((actionKey) => formatActionLabel(actionKey))
                .join(', ')}`;
        })
        .sort((left, right) => {
            const [leftModule] = left.split(':');
            const [rightModule] = right.split(':');
            return (
                getModuleSortIndex(leftModule.toLowerCase().replace(/\s+/g, '_')) -
                    getModuleSortIndex(rightModule.toLowerCase().replace(/\s+/g, '_')) ||
                left.localeCompare(right)
            );
        });

    return {
        headline: `${selectedPermissions.length} permissions across ${Object.keys(modules).length} areas`,
        lines,
        moduleCount: Object.keys(modules).length,
    };
}
