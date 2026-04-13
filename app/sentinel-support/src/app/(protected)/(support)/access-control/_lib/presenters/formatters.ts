import { PERMISSION_CATEGORIES } from '@sentinel/shared/constants';
import { FORMAL_ROLE_LABELS } from './constants';

export function startCase(value: string) {
    return value
        .split(/[_:\s-]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}

export function formatModuleLabel(moduleKey: string) {
    return startCase(moduleKey);
}

export function formatActionLabel(actionKey: string) {
    return startCase(actionKey);
}

export function formatRoleLabel(roleName: string) {
    return FORMAL_ROLE_LABELS[roleName] ?? startCase(roleName);
}

export function getPermissionCategoryLabel(categoryKey: string | null | undefined) {
    if (!categoryKey) return 'Other';
    return (
        PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES] ??
        startCase(categoryKey)
    );
}

export function getPermissionScopeLabel(scope: string | null | undefined) {
    if (!scope) return 'Any scope';
    return startCase(scope);
}
