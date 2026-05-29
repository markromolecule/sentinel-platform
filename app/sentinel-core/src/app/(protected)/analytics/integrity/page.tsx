'use client';

import * as React from 'react';
import { DepartmentIntegrityChart } from '@/app/(protected)/analytics/_components';
import {
    Skeleton,
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
    Button,
    Badge,
    Alert,
    AlertDescription,
    AlertTitle,
} from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsDepartmentIntegrityQuery } from '@/data';
import {
    ArrowUpDown,
    Shield,
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { computeIntegrityRate, getIntegrityTier } from '../_utils/compute-integrity-rate';

type SortConfig = {
    key: 'department' | 'completed' | 'flagged' | 'dropped' | 'integrityRate';
    direction: 'asc' | 'desc';
};

const TIER_BADGE: Record<string, { label: string; className: string }> = {
    high: {
        label: '≥ 95% Excellent',
        className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 border',
    },
    medium: {
        label: '85–94% Acceptable',
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 border',
    },
    low: {
        label: '< 85% At Risk',
        className: 'bg-red-500/10 text-red-500 border-red-500/20 border',
    },
};

const INTEGRITY_THRESHOLD = 85;

/**
 * IntegrityAnalyticsPage displays structural metrics indicating academic honesty
 * and incident frequencies categorized by institution department.
 * Includes an alert banner for at-risk departments, a risk-tier legend,
 * and collapsible row detail for progressive disclosure.
 */
export default function IntegrityAnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();
    const [sort, setSort] = React.useState<SortConfig>({ key: 'integrityRate', direction: 'desc' });
    const [expandedDept, setExpandedDept] = React.useState<string | null>(null);
    const tableRef = React.useRef<HTMLDivElement>(null);

    // Live backend queries with institution scoping
    const { data: departmentData, isLoading: isDepartmentLoading } =
        useAnalyticsDepartmentIntegrityQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    const items = React.useMemo(() => {
        if (!departmentData) return [];

        // Enrich data with a calculated integrity rate using the shared utility
        const enriched = departmentData.map((item) => ({
            ...item,
            integrityRate: computeIntegrityRate(item.completed, item.flagged ?? 0),
        }));

        // Apply sorting
        return [...enriched].sort((a, b) => {
            const aVal = a[sort.key];
            const bVal = b[sort.key];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sort.direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            return 0;
        });
    }, [departmentData, sort]);

    // Departments below the threshold — drives the alert banner
    const atRiskCount = React.useMemo(
        () => items.filter((i) => i.integrityRate < INTEGRITY_THRESHOLD).length,
        [items],
    );

    const handleSort = (key: SortConfig['key']) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
        }));
    };

    const handleScrollToTable = () => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const toggleExpanded = (dept: string) => {
        setExpandedDept((prev) => (prev === dept ? null : dept));
    };

    const isLoading = isScopeLoading || isDepartmentLoading;

    return (
        <AnalyticsPageShell
            title="Integrity by Department"
            description="Examine departmental statistics, session integrity rankings, and academic compliance metrics across all units."
        >
            <div className="flex flex-col gap-6">
                {/* Alert banner for at-risk departments */}
                {!isLoading && atRiskCount > 0 && (
                    <Alert variant="destructive" className="border-red-500/30 bg-red-500/5">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Integrity Alert</AlertTitle>
                        <AlertDescription className="flex flex-wrap items-center gap-2">
                            <span>
                                {atRiskCount} department{atRiskCount > 1 ? 's are' : ' is'} below
                                the {INTEGRITY_THRESHOLD}% integrity threshold.
                            </span>
                            <button
                                onClick={handleScrollToTable}
                                className="cursor-pointer text-sm font-semibold underline"
                            >
                                View flagged departments ↓
                            </button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Risk tier legend */}
                {!isLoading && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Trust Rating:
                        </span>
                        {Object.entries(TIER_BADGE).map(([, badge]) => (
                            <span
                                key={badge.label}
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                            >
                                <Shield className="h-3 w-3" />
                                {badge.label}
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Visual Chart */}
                    <div className="lg:col-span-4">
                        {isLoading ? (
                            <Skeleton className="h-[380px] w-full rounded-xl" />
                        ) : (
                            <DepartmentIntegrityChart data={departmentData || []} />
                        )}
                    </div>

                    {/* Sortable Summary Table */}
                    <div className="lg:col-span-4" ref={tableRef}>
                        <Card className="border-border/50 bg-card/65 backdrop-blur-md">
                            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">
                                        Department Matrix &amp; Compliance Rankings
                                    </CardTitle>
                                    <CardDescription>
                                        Sorted comparison table indicating total session volume and
                                        computed academic trust indexes.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="px-0 sm:px-6">
                                {isLoading ? (
                                    <div className="space-y-4 p-6">
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-[200px] w-full" />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-6" />
                                                    <TableHead>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('department')}
                                                            className="gap-1 px-0 text-xs font-semibold uppercase hover:bg-transparent"
                                                        >
                                                            Department
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('completed')}
                                                            className="ml-auto gap-1 px-0 text-xs font-semibold uppercase hover:bg-transparent"
                                                        >
                                                            Completed
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('flagged')}
                                                            className="ml-auto gap-1 px-0 text-xs font-semibold uppercase hover:bg-transparent"
                                                        >
                                                            Flagged
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleSort('dropped')}
                                                            className="ml-auto gap-1 px-0 text-xs font-semibold uppercase hover:bg-transparent"
                                                        >
                                                            Dropped
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleSort('integrityRate')
                                                            }
                                                            className="ml-auto gap-1 px-0 text-xs font-semibold uppercase hover:bg-transparent"
                                                        >
                                                            Trust Rating
                                                            <ArrowUpDown className="h-3 w-3" />
                                                        </Button>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {items.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={6}
                                                            className="text-muted-foreground py-8 text-center text-sm"
                                                        >
                                                            No departmental data found.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    items.map((item) => {
                                                        const tier = getIntegrityTier(
                                                            item.integrityRate,
                                                        );
                                                        const tierStyle = {
                                                            high: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                                            medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                                                            low: 'bg-red-500/10 text-red-500 border-red-500/20',
                                                        }[tier];
                                                        const isExpanded =
                                                            expandedDept === item.department;

                                                        return (
                                                            <React.Fragment key={item.department}>
                                                                <TableRow
                                                                    className="hover:bg-accent/20 cursor-pointer"
                                                                    onClick={() =>
                                                                        toggleExpanded(
                                                                            item.department,
                                                                        )
                                                                    }
                                                                >
                                                                    <TableCell className="w-6">
                                                                        {isExpanded ? (
                                                                            <ChevronDown className="text-muted-foreground h-4 w-4" />
                                                                        ) : (
                                                                            <ChevronRight className="text-muted-foreground h-4 w-4" />
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-foreground font-semibold">
                                                                        {item.department}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex items-center justify-end gap-1.5 font-medium">
                                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                                            <span>
                                                                                {item.completed}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex items-center justify-end gap-1.5 font-medium">
                                                                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                                                            <span>
                                                                                {item.flagged}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex items-center justify-end gap-1.5 font-medium">
                                                                            <HelpCircle className="text-muted-foreground h-3.5 w-3.5" />
                                                                            <span>
                                                                                {item.dropped}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <span
                                                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tierStyle}`}
                                                                        >
                                                                            <Shield className="h-3 w-3" />
                                                                            {item.integrityRate}%
                                                                        </span>
                                                                    </TableCell>
                                                                </TableRow>

                                                                {/* Progressive disclosure detail row */}
                                                                {isExpanded && (
                                                                    <TableRow className="bg-muted/20">
                                                                        <TableCell colSpan={6}>
                                                                            <div className="space-y-2 px-4 py-3">
                                                                                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                                                                                    Department
                                                                                    Summary
                                                                                </p>
                                                                                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                                                                                    <div>
                                                                                        <p className="text-muted-foreground text-xs">
                                                                                            Total
                                                                                            Sessions
                                                                                        </p>
                                                                                        <p className="font-semibold">
                                                                                            {(
                                                                                                item.completed +
                                                                                                item.dropped
                                                                                            ).toLocaleString()}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-muted-foreground text-xs">
                                                                                            Flag
                                                                                            Rate
                                                                                        </p>
                                                                                        <p className="font-semibold">
                                                                                            {item.completed >
                                                                                            0
                                                                                                ? (
                                                                                                      (item.flagged /
                                                                                                          item.completed) *
                                                                                                      100
                                                                                                  ).toFixed(
                                                                                                      1,
                                                                                                  )
                                                                                                : '0'}
                                                                                            %
                                                                                        </p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-muted-foreground text-xs">
                                                                                            Risk
                                                                                            Tier
                                                                                        </p>
                                                                                        <Badge
                                                                                            variant={
                                                                                                tier ===
                                                                                                'low'
                                                                                                    ? 'destructive'
                                                                                                    : 'secondary'
                                                                                            }
                                                                                            className="text-xs"
                                                                                        >
                                                                                            {tier ===
                                                                                            'high'
                                                                                                ? 'Excellent'
                                                                                                : tier ===
                                                                                                    'medium'
                                                                                                  ? 'Acceptable'
                                                                                                  : 'At Risk'}
                                                                                        </Badge>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-muted-foreground text-xs">
                                                                                            Integrity
                                                                                            Rate
                                                                                        </p>
                                                                                        <p className="font-semibold">
                                                                                            {
                                                                                                item.integrityRate
                                                                                            }
                                                                                            %
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })
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
