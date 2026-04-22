'use client';

import Link from 'next/link';
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
    getSystemRoleResponsibilities,
    summarizeRolePermissions,
    sortRolesForReview,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

import { StatusStrip } from '@/app/(protected)/(support)/telemetry/_components/shared/status-strip';
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
                value: String(overview?.systemRoles ?? 0),
                hint: `${overview?.totalRoles ?? 0} total roles in catalog`,
            },
            {
                label: 'Permissions',
                value: String(overview?.totalPermissions ?? 0),
                hint: `${overview?.modulesCovered ?? 0} modules covered`,
            },
            {
                label: 'Role Assignments',
                value: String(overview?.totalAssignments ?? 0),
                hint: 'Active user-role links',
            },
            {
                label: 'Exceptions',
                value: String(overview?.totalOverrides ?? 0),
                hint: 'User-level overrides',
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
        <div className="space-y-16">
            {/* Command Center Metrics */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                        Command Center
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        Real-time health signals of the platform&apos;s security posture.
                    </p>
                </div>
                <StatusStrip items={metrics} />
            </section>

            <div className="grid gap-16 xl:grid-cols-[1fr_0.4fr]">
                {/* System Roles Catalog */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                                System Role Baseline
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs font-medium">
                                Core system roles and their functional responsibilities.
                            </p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onNavigate('roles')}
                            className="text-[10px] font-bold uppercase tracking-wider"
                        >
                            Review All Roles
                        </Button>
                    </div>

                    <div className="rounded-2xl border bg-card/30 overflow-hidden shadow-sm">
                        <Table className="table-fixed text-[11px]">
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-6">Role Identity</TableHead>
                                    <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Responsibility</TableHead>
                                    <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pr-6 text-right">Coverage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {systemRoles.map((role) => {
                                    const summary = summarizeRolePermissions(role, permissions);
                                    return (
                                        <TableRow key={role.id} className="border-border/40 transition-colors hover:bg-muted/20 last:border-none">
                                            <TableCell className="py-5 pl-6 align-top">
                                                <div className="font-bold text-sm tracking-tight text-foreground/90 uppercase">
                                                    {formatRoleLabel(role.name)}
                                                </div>
                                                <div className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed line-clamp-2 italic">
                                                    {role.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 align-top">
                                                <div className="flex flex-col gap-1.5">
                                                    {getSystemRoleResponsibilities(role.name).slice(0, 2).map((line) => (
                                                        <div key={line} className="text-muted-foreground text-[11px] font-medium leading-tight opacity-90">
                                                            • {line}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5 pr-6 align-top text-right">
                                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold">
                                                    {summary.headline}
                                                </Badge>
                                                <div className="text-muted-foreground mt-1.5 text-[11px] font-medium opacity-70">
                                                    {role.assignmentCount} active links
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
                <div className="space-y-12">
                    {/* Coverage Quick View */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                                Permissions
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs font-medium">
                                Module density tracking.
                            </p>
                        </div>
                        <div className="space-y-3">
                            {permissionCoverage.slice(0, 5).map(([moduleKey, count]) => (
                                <div key={moduleKey} className="flex items-center justify-between rounded-xl border bg-card/40 p-3.5 transition-all hover:bg-card">
                                    <div className="space-y-0.5">
                                        <div className="text-[11px] font-bold uppercase tracking-wide text-foreground/80">
                                            {formatModuleLabel(moduleKey)}
                                        </div>
                                        <div className="text-muted-foreground text-[10px] font-medium opacity-60">
                                            Catalog Coverage
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold tracking-tighter text-foreground/90">{count}</div>
                                        <div className="text-muted-foreground text-[10px] font-medium opacity-60 uppercase">Tags</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Exam Defaults */}
                    <section className="space-y-6">
                        <div>
                            <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                                Exam Defaults
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs font-medium">
                                System-wide baseline settings.
                            </p>
                        </div>
                        <div className="rounded-2xl border bg-card/40 p-5 space-y-4">
                            {examDefaults.map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs font-medium">{item.label}</span>
                                    <span className="text-sm font-bold text-foreground/90">{item.value}</span>
                                </div>
                            ))}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onNavigate('examination-settings')}
                                className="w-full mt-2 text-[10px] font-bold uppercase tracking-wider"
                            >
                                Adjust Defaults
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
