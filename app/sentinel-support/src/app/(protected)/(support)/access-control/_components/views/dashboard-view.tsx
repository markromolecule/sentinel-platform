import {
    useAccessControlExaminationSettingsQuery,
    useAccessControlOverviewQuery,
    useAccessControlPermissionsQuery,
    useAccessControlRolesQuery,
    useStableValue,
} from '@sentinel/hooks';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@sentinel/ui';
import {
    formatModuleLabel,
    formatRoleLabel,
    summarizeRolePermissions,
    sortRolesForReview,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

import { AccessControlMetricStrip } from '../common/access-control-metric-strip';
import { AccessControlLoadingState, AccessControlErrorState } from '@/app/(protected)/(support)/access-control/_components';

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
                <h2 className="text-[12px] font-semibold text-muted-foreground/80">
                    Command Center
                </h2>
                <AccessControlMetricStrip items={metrics} />
            </section>

            <div className="grid gap-10 xl:grid-cols-[1fr_320px]">
                {/* System Roles Catalog */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[12px] font-semibold text-muted-foreground/80">
                            System Role Baseline
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate('roles')}
                            className="h-8 rounded-none px-3 text-[12px] font-semibold bg-background border-muted/50"
                        >
                            View Registry
                        </Button>
                    </div>

                    <div className="overflow-hidden">
                        <Table className="text-sm">
                            <TableHeader className="bg-muted/5">
                                <TableRow className="border-t border-l border-r border-[#323d8f]/10 hover:bg-transparent h-11">
                                    <TableHead className="text-[12px] font-semibold text-muted-foreground/80 pl-5 w-[160px]">Role Identity</TableHead>
                                    <TableHead className="text-[12px] font-semibold text-muted-foreground/80">Description</TableHead>
                                    <TableHead className="text-[12px] font-semibold text-muted-foreground/80 pr-5 text-right w-[180px]">Coverage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {systemRoles.map((role) => {
                                    const summary = summarizeRolePermissions(role, permissions);
                                    return (
                                        <TableRow key={role.id} className="bg-background border-b border-muted/50 transition-colors hover:bg-muted/30 border-l-2 border-l-[#323d8f]/30 border border-[#323d8f]/10">
                                            <TableCell className="py-4 pl-5 align-middle font-semibold text-[14px] tracking-tight text-foreground">
                                                {formatRoleLabel(role.name)}
                                            </TableCell>
                                            <TableCell className="py-4 align-middle text-[12px] font-medium text-muted-foreground whitespace-normal leading-relaxed">
                                                {role.description}
                                            </TableCell>
                                            <TableCell className="py-4 pr-5 align-middle text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                    <div className="text-muted-foreground text-[12px] font-semibold opacity-60">
                                                        {role.assignmentCount} Links
                                                    </div>
                                                    <Badge variant="secondary" className="rounded-none bg-muted text-foreground border-muted text-[11px] font-semibold h-6 px-2 tracking-tight">
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
                        <h2 className="text-[12px] font-semibold text-muted-foreground/80">
                            Permissions Coverage
                        </h2>
                        <div className="rounded-none border border-muted/50 bg-background divide-y divide-muted/50 overflow-hidden">
                            {permissionCoverage.slice(0, 5).map(([moduleKey, count]) => (
                                <div key={moduleKey} className="flex items-center justify-between p-4 transition-all bg-[#f4faff] hover:bg-[#ebf5ff]">
                                    <div className="text-[12px] font-semibold text-muted-foreground/80">
                                        {formatModuleLabel(moduleKey)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-[14px] font-semibold tracking-tighter text-foreground">{count}</div>
                                        <div className="text-[11px] font-semibold opacity-40 text-muted-foreground">Tags</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Exam Defaults */}
                    <section className="space-y-4">
                        <h2 className="text-[12px] font-semibold text-muted-foreground/80">
                            System Defaults
                        </h2>
                        <div className="rounded-none border border-muted/50 bg-background p-5 space-y-4">
                            <div className="space-y-3.5">
                                {examDefaults.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between border-b border-muted/50 pb-3.5 last:border-none last:pb-0">
                                        <span className="text-muted-foreground text-[12px] font-semibold">{item.label}</span>
                                        <span className="text-[14px] font-semibold text-foreground tabular-nums">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onNavigate('examination-settings')}
                                className="w-full h-8 rounded-none text-[12px] font-semibold bg-background border-muted/50 hover:bg-muted/50"
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
