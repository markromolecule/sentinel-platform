'use client';

import Link from 'next/link';
import {
    useAccessControlExaminationSettingsQuery,
    useAccessControlOverviewQuery,
    useAccessControlPermissionsQuery,
    useAccessControlRolesQuery,
} from '@sentinel/hooks';
import { Button } from '@sentinel/ui';
import {
    AccessControlErrorState,
    AccessControlLoadingState,
    AccessControlPageShell,
} from '@/app/(protected)/(support)/access-control/_components';
import {
    formatModuleLabel,
    getSystemRoleResponsibilities,
    summarizeRolePermissions,
    sortRolesForReview,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

export default function AccessControlOverviewPage() {
    const { data: overview, isLoading: isOverviewLoading, error: overviewError } =
        useAccessControlOverviewQuery();
    const { data: roles = [], isLoading: isRolesLoading, error: rolesError } =
        useAccessControlRolesQuery();
    const { data: permissions = [], isLoading: isPermissionsLoading, error: permissionsError } =
        useAccessControlPermissionsQuery();
    const { data: settings, isLoading: isSettingsLoading, error: settingsError } =
        useAccessControlExaminationSettingsQuery();

    const isLoading =
        isOverviewLoading || isRolesLoading || isPermissionsLoading || isSettingsLoading;
    const error = overviewError || rolesError || permissionsError || settingsError;

    const permissionCoverage = Object.entries(
        permissions.reduce<Record<string, number>>((groups, permission) => {
            groups[permission.moduleKey] = (groups[permission.moduleKey] || 0) + 1;
            return groups;
        }, {}),
    ).sort((left, right) => right[1] - left[1]);

    const systemRoles = sortRolesForReview(roles).filter((role) => role.isSystem);

    return (
        <AccessControlPageShell
            title="Access Control"
            description="Support workspace for RBAC governance, role baselines, permission coverage, and examination-wide defaults."
        >
            {isLoading ? (
                <AccessControlLoadingState />
            ) : error ? (
                <AccessControlErrorState message={error.message} />
            ) : (
                <div className="grid gap-8">
                    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-base font-semibold tracking-tight">
                                    Control center
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    A quick health read on the RBAC layer before you drill into configuration.
                                </p>
                            </div>

                            <div className="divide-y border-y">
                                {[
                                    [
                                        'System roles',
                                        `${overview?.systemRoles ?? 0} protected role baselines`,
                                        `${overview?.totalRoles ?? 0} total roles in the catalog`,
                                    ],
                                    [
                                        'Permissions',
                                        `${overview?.totalPermissions ?? 0} permission definitions`,
                                        `${overview?.modulesCovered ?? 0} modules currently covered`,
                                    ],
                                    [
                                        'Assignments',
                                        `${overview?.totalAssignments ?? 0} active role links`,
                                        'User-role ownership across the platform',
                                    ],
                                    [
                                        'Overrides',
                                        `${overview?.totalOverrides ?? 0} exception records`,
                                        'User-level allows and denies stored in RBAC',
                                    ],
                                    [
                                        'Exam defaults',
                                        settings?.updatedAt
                                            ? `Updated ${new Date(settings.updatedAt).toLocaleDateString()}`
                                            : 'No baseline update recorded yet',
                                        `${settings?.value.defaultDurationMinutes ?? 0} minutes default duration`,
                                    ],
                                ].map(([label, value, detail]) => (
                                    <div
                                        key={label}
                                        className="grid gap-1 py-4 md:grid-cols-[0.7fr_1.3fr]"
                                    >
                                        <div className="text-sm font-medium">{label}</div>
                                        <div>
                                            <div className="font-medium">{value}</div>
                                            <div className="text-muted-foreground text-sm">
                                                {detail}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold tracking-tight">
                                        Workspace areas
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Every area below is editable so support can actively manage coverage.
                                    </p>
                                </div>
                            </div>

                            <div className="divide-y border-y">
                                {[
                                    {
                                        href: '/access-control/roles',
                                        title: 'Roles',
                                        detail: 'Review role purpose, grouped access coverage, and permission baselines.',
                                        meta: `${roles.length} roles`,
                                    },
                                    {
                                        href: '/access-control/permissions',
                                        title: 'Permissions',
                                        detail: 'Manage the catalog by module, action, and operational category.',
                                        meta: `${permissions.length} permissions`,
                                    },
                                    {
                                        href: '/access-control/assignments',
                                        title: 'Assignments',
                                        detail: 'Map users to roles and adjust ownership when responsibilities change.',
                                        meta: `${overview?.totalAssignments ?? 0} assignments`,
                                    },
                                    {
                                        href: '/access-control/examination-settings',
                                        title: 'Exam Settings',
                                        detail: 'Control system-wide defaults for duration, scoring, proctoring, and device rules.',
                                        meta: settings?.updatedAt
                                            ? `Updated ${new Date(settings.updatedAt).toLocaleDateString()}`
                                            : 'Needs review',
                                    },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="hover:bg-muted/20 grid gap-2 py-4 transition-colors md:grid-cols-[1fr_auto]"
                                    >
                                        <div>
                                            <div className="font-medium">{item.title}</div>
                                            <p className="text-muted-foreground text-sm">
                                                {item.detail}
                                            </p>
                                        </div>
                                        <div className="text-muted-foreground text-sm md:text-right">
                                            {item.meta}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold tracking-tight">
                                        System role baseline
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        The default role posture aligned to platform responsibilities.
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/access-control/roles">Open roles</Link>
                                </Button>
                            </div>

                            <div className="overflow-x-auto border-y">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-3 pr-4 font-medium">Role</th>
                                            <th className="py-3 pr-4 font-medium">Responsibility</th>
                                            <th className="py-3 pr-4 font-medium">Coverage</th>
                                            <th className="py-3 font-medium">Assignments</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {systemRoles.map((role) => {
                                            const summary = summarizeRolePermissions(role, permissions);
                                            const responsibilities = getSystemRoleResponsibilities(
                                                role.name,
                                            );

                                            return (
                                                <tr key={role.id} className="align-top">
                                                    <td className="py-4 pr-4">
                                                        <div className="font-medium">{role.name}</div>
                                                        <div className="text-muted-foreground mt-1 text-sm">
                                                            {role.description}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="space-y-1">
                                                            {responsibilities.slice(0, 2).map((line) => (
                                                                <div
                                                                    key={line}
                                                                    className="text-muted-foreground text-sm"
                                                                >
                                                                    {line}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="font-medium">
                                                            {summary.headline}
                                                        </div>
                                                        <div className="text-muted-foreground mt-1 text-sm">
                                                            {summary.lines[0] ?? 'No grouped coverage yet'}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="font-medium">
                                                            {role.assignmentCount}
                                                        </div>
                                                        <div className="text-muted-foreground mt-1 text-sm">
                                                            active assignments
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold tracking-tight">
                                        Coverage highlights
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Dense modules and current examination defaults.
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/access-control/permissions">Open permissions</Link>
                                </Button>
                            </div>

                            <div className="divide-y border-y">
                                {permissionCoverage.slice(0, 6).map(([moduleKey, count]) => (
                                    <div
                                        key={moduleKey}
                                        className="flex items-center justify-between gap-4 py-4"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {formatModuleLabel(moduleKey)}
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                Module coverage in the permission catalog
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{count}</div>
                                            <div className="text-muted-foreground text-sm">
                                                permissions
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="divide-y border-y">
                                {[
                                    [
                                        'Duration',
                                        `${settings?.value.defaultDurationMinutes ?? 0} minutes`,
                                    ],
                                    [
                                        'Passing score',
                                        `${settings?.value.defaultPassingScore ?? 0}%`,
                                    ],
                                    [
                                        'Reconnect attempts',
                                        String(settings?.value.defaultMaxReconnectAttempts ?? 0),
                                    ],
                                    [
                                        'Allowed devices',
                                        (settings?.value.defaultAllowedDevices ?? []).join(', ') ||
                                        'Not configured',
                                    ],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between gap-4 py-4"
                                    >
                                        <div className="text-muted-foreground text-sm">{label}</div>
                                        <div className="text-right text-sm font-medium">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </AccessControlPageShell>
    );
}
