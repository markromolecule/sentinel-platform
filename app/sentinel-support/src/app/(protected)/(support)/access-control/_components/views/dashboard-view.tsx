import {
    useAccessControlExaminationSettingsQuery,
    useAccessControlOverviewQuery,
    useAccessControlPermissionsQuery,
    useAccessControlRolesQuery,
    useStableValue,
} from '@sentinel/hooks';
import {
    Badge,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@sentinel/ui';
import {
    formatModuleLabel,
    formatRoleLabel,
    summarizeRolePermissions,
    sortRolesForReview,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

import { AccessControlMetricStrip } from '../common/access-control-metric-strip';
import {
    AccessControlLoadingState,
    AccessControlErrorState,
} from '@/app/(protected)/(support)/access-control/_components';

export type DashboardViewProps = {
    onNavigate: (section: 'roles' | 'permissions' | 'assignments' | 'examination-settings') => void;
};

export function DashboardView({ onNavigate }: DashboardViewProps) {
    const {
        data: overview,
        isLoading: isOverviewLoading,
        error: overviewError,
    } = useAccessControlOverviewQuery();
    const {
        data: roles = [],
        isLoading: isRolesLoading,
        error: rolesError,
    } = useAccessControlRolesQuery();
    const {
        data: permissions = [],
        isLoading: isPermissionsLoading,
        error: permissionsError,
    } = useAccessControlPermissionsQuery();
    const {
        data: settings,
        isLoading: isSettingsLoading,
        error: settingsError,
    } = useAccessControlExaminationSettingsQuery();

    const isLoading =
        isOverviewLoading || isRolesLoading || isPermissionsLoading || isSettingsLoading;
    const error = overviewError || rolesError || permissionsError || settingsError;

    const permissionCoverage = useStableValue(
        () =>
            Object.entries(
                permissions.reduce<Record<string, number>>((groups, permission) => {
                    groups[permission.moduleKey] = (groups[permission.moduleKey] || 0) + 1;
                    return groups;
                }, {}),
            ).sort((left, right) => right[1] - left[1]),
        [permissions],
    );

    const systemRoles = useStableValue(
        () => sortRolesForReview(roles).filter((role) => role.isSystem),
        [roles],
    );

    const metrics = useStableValue(
        () => [
            {
                label: 'Protected Roles',
                value: overview?.systemRoles ?? 0,
                hint: `${overview?.totalRoles ?? 0} Total Roles`,
            },
            {
                label: 'Permissions',
                value: overview?.totalPermissions ?? 0,
                hint: `${overview?.modulesCovered ?? 0} Modules Covered`,
            },
            {
                label: 'Role Assignments',
                value: overview?.totalAssignments ?? 0,
                hint: 'Active User-Role Links',
            },
            {
                label: 'Exceptions',
                value: overview?.totalOverrides ?? 0,
                hint: 'User-level Overrides',
            },
        ],
        [overview],
    );

    const examDefaults = useStableValue(
        () => [
            { label: 'Time Limit', value: `${settings?.value.defaultDurationMinutes ?? 0}m` },
            { label: 'Pass Mark', value: `${settings?.value.defaultPassingScore ?? 0}%` },
            { label: 'Retries', value: String(settings?.value.defaultMaxReconnectAttempts ?? 0) },
        ],
        [settings],
    );

    if (isLoading) return <AccessControlLoadingState />;
    if (error) return <AccessControlErrorState message={error.message} />;

    return (
        <div className="space-y-10">
            {/* Command Center Metrics */}
            <section className="space-y-4">
                <h2 className="text-muted-foreground/80 text-[12px] font-semibold">
                    Command Center
                </h2>
                <AccessControlMetricStrip items={metrics} />
            </section>

            <div className="grid gap-10 xl:grid-cols-[1fr_320px]">
                {/* System Roles Catalog */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-muted-foreground/80 text-[12px] font-semibold">
                            System Role Baseline
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('roles')}
                            className="bg-background border-muted/50 h-8 rounded-none px-3 text-[12px] font-semibold"
                        >
                            View Registry
                        </Button>
                    </div>

                    <div className="overflow-hidden">
                        <Table className="text-sm">
                            <TableHeader className="bg-muted/5">
                                <TableRow className="h-11 border-t border-r border-l border-[#323d8f]/10 hover:bg-transparent">
                                    <TableHead className="text-muted-foreground/80 w-[160px] pl-5 text-[12px] font-semibold">
                                        Role Identity
                                    </TableHead>
                                    <TableHead className="text-muted-foreground/80 text-[12px] font-semibold">
                                        Description
                                    </TableHead>
                                    <TableHead className="text-muted-foreground/80 w-[180px] pr-5 text-right text-[12px] font-semibold">
                                        Coverage
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {systemRoles.map((role) => {
                                    const summary = summarizeRolePermissions(role, permissions);
                                    return (
                                        <TableRow
                                            key={role.id}
                                            className="bg-background border-muted/50 hover:bg-muted/30 border border-b border-l-2 border-[#323d8f]/10 border-l-[#323d8f]/30 transition-colors"
                                        >
                                            <TableCell className="text-foreground py-4 pl-5 align-middle text-[14px] font-semibold tracking-tight">
                                                {formatRoleLabel(role.name)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground py-4 align-middle text-[12px] leading-relaxed font-medium whitespace-normal">
                                                {role.description}
                                            </TableCell>
                                            <TableCell className="py-4 pr-5 text-right align-middle">
                                                <div className="flex items-center justify-end gap-4">
                                                    <div className="text-muted-foreground text-[12px] font-semibold opacity-60">
                                                        {role.assignmentCount} Links
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-muted text-foreground border-muted h-6 rounded-none px-2 text-[11px] font-semibold tracking-tight"
                                                    >
                                                        {summary.headline.split(' ')[0]}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* Side Panels */}
                <div className="space-y-10">
                    {/* Coverage Quick View */}
                    <section className="space-y-4">
                        <h2 className="text-muted-foreground/80 text-[12px] font-semibold">
                            Permissions Coverage
                        </h2>
                        <div className="border-muted/50 bg-background divide-muted/50 divide-y overflow-hidden rounded-none border">
                            {permissionCoverage.slice(0, 5).map(([moduleKey, count]) => (
                                <div
                                    key={moduleKey}
                                    className="flex items-center justify-between bg-[#f4faff] p-4 transition-all hover:bg-[#ebf5ff]"
                                >
                                    <div className="text-muted-foreground/80 text-[12px] font-semibold">
                                        {formatModuleLabel(moduleKey)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-foreground text-[14px] font-semibold tracking-tighter">
                                            {count}
                                        </div>
                                        <div className="text-muted-foreground text-[11px] font-semibold opacity-40">
                                            Tags
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Exam Defaults */}
                    <section className="space-y-4">
                        <h2 className="text-muted-foreground/80 text-[12px] font-semibold">
                            System Defaults
                        </h2>
                        <div className="border-muted/50 bg-background space-y-4 rounded-none border p-5">
                            <div className="space-y-3.5">
                                {examDefaults.map((item) => (
                                    <div
                                        key={item.label}
                                        className="border-muted/50 flex items-center justify-between border-b pb-3.5 last:border-none last:pb-0"
                                    >
                                        <span className="text-muted-foreground text-[12px] font-semibold">
                                            {item.label}
                                        </span>
                                        <span className="text-foreground text-[14px] font-semibold tabular-nums">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onNavigate('examination-settings')}
                                className="bg-background border-muted/50 hover:bg-muted/50 h-8 w-full rounded-none text-[12px] font-semibold"
                            >
                                Settings
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
