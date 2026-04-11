import {
    PERMISSION_CATEGORIES,
    SYSTEM_ROLE_BLUEPRINTS,
    SYSTEM_ROLE_ORDER,
} from '@sentinel/shared/constants';
import type { AccessControlPermission, AccessControlRole } from '@sentinel/shared/types';

export type CrudBucketKey = 'view' | 'create' | 'update' | 'delete';

const CATEGORY_SORT_ORDER = Object.keys(PERMISSION_CATEGORIES);

const ACTION_SORT_ORDER = [
    'view',
    'create',
    'update',
    'delete',
    'offer',
    'request',
    'approve',
    'reject',
    'unapprove',
    'import',
    'purge',
    'publish',
    'take',
    'review',
    'export',
    'monitor',
    'respond_to_flags',
    'view_sessions',
    'create_superadmin',
    'create_admin',
    'create_staff',
    'create_student',
    'manage_roles',
    'manage_permissions',
    'manage_assignments',
] as const;

const MODULE_SORT_ORDER = [
    'institutions',
    'departments',
    'semesters',
    'rooms',
    'users',
    'access_control',
    'courses',
    'sections',
    'subjects',
    'subject_offerings',
    'subject_requests',
    'student_whitelist',
    'examination_settings',
    'examinations',
    'results',
    'proctoring',
    'incidents',
    'reports',
    'guides',
    'dashboard',
] as const;

function startCase(value: string) {
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

export function getActionSortIndex(actionKey: string) {
    const index = ACTION_SORT_ORDER.indexOf(actionKey as (typeof ACTION_SORT_ORDER)[number]);
    return index === -1 ? ACTION_SORT_ORDER.length : index;
}

export function getModuleSortIndex(moduleKey: string) {
    const index = MODULE_SORT_ORDER.indexOf(moduleKey as (typeof MODULE_SORT_ORDER)[number]);
    return index === -1 ? MODULE_SORT_ORDER.length : index;
}

export function getModuleHelperText(moduleKey: string) {
    const helpers: Record<string, string> = {
        institutions: 'Global institution setup and lifecycle control.',
        departments: 'Department structure, ownership, and academic grouping.',
        semesters: 'Term setup, dates, and scheduling windows.',
        rooms: 'Institution-scoped examination venues and room availability.',
        users: 'Account provisioning and role-targeted user creation.',
        access_control: 'RBAC catalog, assignments, and permission ownership.',
        courses: 'Department-level course maintenance and oversight.',
        sections: 'Course-level section creation and upkeep.',
        subjects: 'Shared subject catalog and academic metadata.',
        subject_offerings: 'Offered-subject lifecycle including offer and approval.',
        subject_requests: 'Instructor requests and approval flow for subject participation.',
        student_whitelist: 'Student whitelist intake, correction, import, and purge.',
        examination_settings: 'Global examination defaults and enforcement baselines.',
        examinations: 'Exam access, participation, and publishing lifecycle.',
        results: 'Assessment results and completion visibility.',
        proctoring: 'Live sessions, monitoring, and flag response.',
        incidents: 'Incident review, evidence, and disciplinary action.',
        reports: 'Operational and compliance reporting output.',
        guides: 'Guides and help resources available to the role.',
        dashboard: 'Role dashboard visibility and summaries.',
    };

    return helpers[moduleKey] ?? 'Permission coverage for this module.';
}

export function getPermissionCategoryLabel(categoryKey: string | null | undefined) {
    if (!categoryKey) return 'Other';
    return PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES] ?? startCase(categoryKey);
}

export function getPermissionScopeLabel(scope: string | null | undefined) {
    if (!scope) return 'Any scope';
    return startCase(scope);
}

function getPermissionCategorySortIndex(categoryKey: string | null | undefined) {
    if (!categoryKey) return CATEGORY_SORT_ORDER.length;

    const index = CATEGORY_SORT_ORDER.indexOf(categoryKey);
    return index === -1 ? CATEGORY_SORT_ORDER.length : index;
}

const SYSTEM_AREAS = [
    {
        key: 'core',
        title: 'Core Modules',
        description: 'Academic and institutional modules from the core backend area.',
        sourcePath: 'app/sentinel-api/src/modules/core',
        moduleKeys: [
            'institutions',
            'departments',
            'semesters',
            'rooms',
            'courses',
            'sections',
            'subjects',
            'subject_offerings',
        ],
    },
    {
        key: 'identity',
        title: 'Identity Modules',
        description: 'Account, whitelist, and request modules from the identity backend area.',
        sourcePath: 'app/sentinel-api/src/modules/identity',
        moduleKeys: ['users', 'subject_requests', 'student_whitelist'],
    },
    {
        key: 'security',
        title: 'Security Modules',
        description: 'RBAC and access-control modules from the security backend area.',
        sourcePath: 'app/sentinel-api/src/modules/security',
        moduleKeys: ['access_control'],
    },
    {
        key: 'examination',
        title: 'Examination Modules',
        description: 'Assessment and examination-related controls.',
        sourcePath: 'app/sentinel-api/src/modules/examination',
        moduleKeys: ['examination_settings', 'examinations', 'results'],
    },
    {
        key: 'operations',
        title: 'Operational Modules',
        description: 'Monitoring, reporting, guidance, and platform visibility modules.',
        sourcePath: 'cross-module platform services',
        moduleKeys: ['proctoring', 'incidents', 'reports', 'guides', 'dashboard'],
    },
];

export function mapActionKeyToCrudBucket(actionKey: string): CrudBucketKey {
    if (actionKey === 'view' || actionKey === 'view_sessions' || actionKey === 'export') {
        return 'view';
    }

    if (
        actionKey === 'create' ||
        actionKey.startsWith('create_') ||
        actionKey === 'offer' ||
        actionKey === 'request' ||
        actionKey === 'import'
    ) {
        return 'create';
    }

    if (actionKey === 'delete' || actionKey === 'purge') {
        return 'delete';
    }

    return 'update';
}

export function getCrudBucketLabel(bucketKey: CrudBucketKey) {
    const labels: Record<CrudBucketKey, string> = {
        view: 'View',
        create: 'Create',
        update: 'Update',
        delete: 'Delete',
    };

    return labels[bucketKey];
}

export function getCrudBucketHelperText(bucketKey: CrudBucketKey, permissions: AccessControlPermission[]) {
    if (permissions.length === 0) {
        return 'Not used';
    }

    const labels = permissions
        .map((permission) => formatActionLabel(permission.actionKey))
        .sort((left, right) => left.localeCompare(right));

    return labels.join(', ');
}

export function groupPermissionsBySystemArea(permissions: AccessControlPermission[]) {
    const permissionsByModule = permissions.reduce<Record<string, AccessControlPermission[]>>(
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
    const grouped = permissions.reduce<
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
                            getActionSortIndex(left.actionKey) - getActionSortIndex(right.actionKey);

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
        groups[permission.moduleKey] = [...(groups[permission.moduleKey] || []), permission.actionKey];
        return groups;
    }, {});

    const lines = Object.entries(modules)
        .map(([moduleKey, actionKeys]) => {
            const uniqueActions = Array.from(new Set(actionKeys)).sort((left, right) =>
                getActionSortIndex(left) - getActionSortIndex(right) || left.localeCompare(right),
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

export function getSystemRoleResponsibilities(roleName: string) {
    return SYSTEM_ROLE_BLUEPRINTS[roleName]?.responsibilities ?? [];
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
