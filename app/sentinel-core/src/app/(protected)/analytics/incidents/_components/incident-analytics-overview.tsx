'use client';

import * as React from 'react';
import { IncidentTypeDistribution } from '@sentinel/services';
import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    cn,
} from '@sentinel/ui';

type IncidentAnalyticsOverviewProps = {
    typeData: IncidentTypeDistribution[];
};

const INCIDENT_LABELS: Record<string, string> = {
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

function formatIncidentLabel(type: string) {
    return INCIDENT_LABELS[type] ?? type.replaceAll('_', ' ').toLowerCase();
}

function getRiskMeta(percentage: number) {
    if (percentage >= 40) {
        return {
            label: 'High',
            className: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        };
    }

    if (percentage >= 20) {
        return {
            label: 'Moderate',
            className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        };
    }

    return {
        label: 'Low',
        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    };
}

function MetricCard({
    label,
    value,
    helper,
}: {
    label: string;
    value: string | number;
    helper: string;
}) {
    return (
        <Card className="border-border/60 bg-card gap-0 py-0 shadow-sm">
            <CardContent className="space-y-2 p-3 sm:p-4">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    {label}
                </p>
                <div className="space-y-0.5">
                    <p className="text-foreground text-2xl leading-none font-semibold tracking-tight">
                        {value}
                    </p>
                    <p className="text-muted-foreground text-sm leading-5">{helper}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export function IncidentAnalyticsOverview({ typeData }: IncidentAnalyticsOverviewProps) {
    const sortedTypes = React.useMemo(
        () => [...typeData].sort((a, b) => b.count - a.count),
        [typeData],
    );

    const totalIncidents = React.useMemo(
        () => sortedTypes.reduce((sum, item) => sum + item.count, 0),
        [sortedTypes],
    );

    const uniqueTypes = sortedTypes.length;

    const topType = sortedTypes[0];

    const topThreeShare = React.useMemo(() => {
        const totalTopThree = sortedTypes.slice(0, 3).reduce((sum, item) => sum + item.count, 0);
        return totalIncidents > 0 ? Math.round((totalTopThree / totalIncidents) * 100) : 0;
    }, [sortedTypes, totalIncidents]);

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Total incidents"
                    value={totalIncidents.toLocaleString()}
                    helper="All flagged events across the selected institution."
                />
                <MetricCard
                    label="Unique incident types"
                    value={uniqueTypes.toLocaleString()}
                    helper="Distinct violation patterns currently recorded."
                />
                <MetricCard
                    label="Top incident type"
                    value={topType ? formatIncidentLabel(topType.type) : 'None'}
                    helper={
                        topType
                            ? `${topType.count.toLocaleString()} incidents recorded`
                            : 'No incident types available yet.'
                    }
                />
                <MetricCard
                    label="Top 3 share"
                    value={`${topThreeShare}%`}
                    helper="How concentrated the current incident mix is."
                />
            </div>

            <Card className="border-border/60 bg-card shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Incident breakdown</CardTitle>
                    <CardDescription>
                        Detailed share and risk context for each incident type.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Violation type</TableHead>
                                    <TableHead className="text-right">Count</TableHead>
                                    <TableHead className="text-right">% Share</TableHead>
                                    <TableHead className="text-right">Risk</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedTypes.length > 0 ? (
                                    sortedTypes.map((item) => {
                                        const risk = getRiskMeta(item.percentage);
                                        return (
                                            <TableRow key={item.type}>
                                                <TableCell className="font-medium">
                                                    {formatIncidentLabel(item.type)}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {item.count.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {item.percentage.toFixed(1)}%
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className={risk.className}>
                                                        {risk.label}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-muted-foreground py-8 text-center text-sm"
                                        >
                                            No incident data available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
