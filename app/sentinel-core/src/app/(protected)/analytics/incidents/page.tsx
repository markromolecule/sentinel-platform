'use client';

import * as React from 'react';
import {
    IncidentTrendsChart,
    IncidentByTypeChart,
    IncidentSeverityChart,
} from '@/app/(protected)/analytics/_components';
import { IncidentStatsCallout } from '@/app/(protected)/analytics/_components/incident-stats-callout';
import {
    Skeleton,
    Badge,
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import {
    useAnalyticsIncidentSeverityQuery,
    useAnalyticsIncidentTypeQuery,
    useAnalyticsIncidentTrendsQuery,
} from '@/data';
import { ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import { IncidentTypeDistribution } from '@sentinel/services';

/** Derives the threshold badge color based on incident percentage share. */
function getShareBadgeVariant(percentage: number): 'destructive' | 'secondary' | 'outline' {
    if (percentage >= 40) return 'destructive';
    if (percentage >= 20) return 'secondary';
    return 'outline';
}

/** Human-readable labels for telemetry incident types. */
const FRIENDLY_LABELS: Record<string, string> = {
    TAB_SWITCH: 'Tab Switching',
    GAZE: 'Gaze / Eye Deviation',
    FACE_NOT_VISIBLE: 'Face Not Visible',
    AUDIO_DETECTED: 'Audio Detected',
    MULTIPLE_FACES: 'Multiple Faces',
    APP_BACKGROUNDING: 'App Backgrounded',
    SCREENSHOT: 'Screenshot Attempted',
    SCREEN_RECORD: 'Screen Recording',
    ROOT_JAILBREAK_DETECTED: 'Jailbreak Detected',
    APP_PINNING_VIOLATION: 'App Pinning Violation',
    NOTIFICATION_BLOCK_VIOLATION: 'Notification Blocked',
};

/**
 * IncidentsAnalyticsPage displays visual analytics specifically related to proctoring incidents,
 * violations severity, and category distribution, with stat callouts and a detail table.
 */
export default function IncidentsAnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();

    // Live backend queries with institution scoping
    const { data: severityData, isLoading: isSeverityLoading } = useAnalyticsIncidentSeverityQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    const { data: typeData, isLoading: isTypeLoading } = useAnalyticsIncidentTypeQuery({
        payload: { institution_id: institutionId || undefined },
        enabled: !isScopeLoading,
    });

    const { data: incidentTrendsData, isLoading: isIncidentTrendsLoading } =
        useAnalyticsIncidentTrendsQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    // Derive stat callout values from live data
    const totalIncidents = React.useMemo(
        () => (typeData ?? []).reduce((sum, item) => sum + item.count, 0),
        [typeData],
    );

    const mostCommonType = React.useMemo(() => {
        if (!typeData || typeData.length === 0) return { label: '—', count: 0 };
        const top = [...typeData].sort((a, b) => b.count - a.count)[0];
        return { label: FRIENDLY_LABELS[top.type] ?? top.type, count: top.count };
    }, [typeData]);

    const criticalCount = React.useMemo(
        () => (severityData ?? []).find((s) => s.severity === 'HIGH')?.count ?? 0,
        [severityData],
    );

    // Sorted type breakdown table data
    const sortedTypeData = React.useMemo(
        () => [...(typeData ?? [])].sort((a, b) => b.count - a.count),
        [typeData],
    );

    const isLoading = isScopeLoading || isTypeLoading || isSeverityLoading;

    return (
        <AnalyticsPageShell
            title="Incident Analytics"
            description="Visualize, track, and filter exam security violations, severity trends, and specific infraction category types."
        >
            <div className="flex flex-col gap-6">
                {/* Stat callouts */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-[100px] w-full rounded-xl" />
                            <Skeleton className="h-[100px] w-full rounded-xl" />
                            <Skeleton className="h-[100px] w-full rounded-xl" />
                        </>
                    ) : (
                        <>
                            <IncidentStatsCallout
                                label="Total Incidents This Period"
                                value={totalIncidents.toLocaleString()}
                                description="Across all violation categories"
                                icon={ShieldAlert}
                                colorClass="bg-red-500/10 text-red-500 border-red-500/20"
                            />
                            <IncidentStatsCallout
                                label="Most Common Violation"
                                value={mostCommonType.label}
                                description={`${mostCommonType.count.toLocaleString()} occurrences`}
                                icon={Zap}
                                colorClass="bg-amber-500/10 text-amber-500 border-amber-500/20"
                            />
                            <IncidentStatsCallout
                                label="Critical Severity Count"
                                value={criticalCount.toLocaleString()}
                                description="High-severity incidents requiring immediate review"
                                icon={AlertTriangle}
                                colorClass="bg-orange-500/10 text-orange-500 border-orange-500/20"
                            />
                        </>
                    )}
                </div>

                {/* Charts grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Trends chart */}
                    <div className="lg:col-span-4">
                        {isScopeLoading || isIncidentTrendsLoading ? (
                            <Skeleton className="h-[380px] w-full rounded-xl" />
                        ) : (
                            <IncidentTrendsChart
                                data={
                                    (incidentTrendsData as unknown as Record<string, unknown>[]) ||
                                    []
                                }
                            />
                        )}
                    </div>

                    {/* Severity distribution chart */}
                    <div className="lg:col-span-2">
                        {isLoading ? (
                            <Skeleton className="h-[380px] w-full rounded-xl" />
                        ) : (
                            <IncidentSeverityChart data={severityData || []} />
                        )}
                    </div>

                    {/* Category breakdown chart */}
                    <div className="lg:col-span-2">
                        {isLoading ? (
                            <Skeleton className="h-[380px] w-full rounded-xl" />
                        ) : (
                            <IncidentByTypeChart data={typeData || []} />
                        )}
                    </div>

                    {/* Incident type breakdown table */}
                    <div className="lg:col-span-4">
                        <Card className="border-border/50 bg-card/65 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    Violation Type Breakdown
                                </CardTitle>
                                <CardDescription>
                                    Sorted by frequency — percentage share indicates relative
                                    severity
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 sm:px-6">
                                {isLoading ? (
                                    <Skeleton className="h-[200px] w-full" />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Violation Type</TableHead>
                                                    <TableHead className="text-right">
                                                        Count
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        % Share
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Risk Level
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedTypeData.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={4}
                                                            className="text-muted-foreground py-8 text-center text-sm"
                                                        >
                                                            No incident data available.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    sortedTypeData.map(
                                                        (item: IncidentTypeDistribution) => (
                                                            <TableRow
                                                                key={item.type}
                                                                className="hover:bg-accent/20"
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {FRIENDLY_LABELS[item.type] ??
                                                                        item.type}
                                                                </TableCell>
                                                                <TableCell className="text-right tabular-nums">
                                                                    {item.count.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className="text-right tabular-nums">
                                                                    {item.percentage.toFixed(1)}%
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Badge
                                                                        variant={getShareBadgeVariant(
                                                                            item.percentage,
                                                                        )}
                                                                    >
                                                                        {item.percentage >= 40
                                                                            ? 'High'
                                                                            : item.percentage >= 20
                                                                              ? 'Medium'
                                                                              : 'Low'}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AnalyticsPageShell>
    );
}
