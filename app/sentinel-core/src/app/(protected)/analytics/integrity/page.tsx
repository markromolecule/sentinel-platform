'use client';

import * as React from 'react';
import { DepartmentIntegrityChart } from '@/app/(protected)/analytics/_components';
import { Skeleton, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@sentinel/ui';
import { AnalyticsPageShell } from '../_components/layout';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useAnalyticsDepartmentIntegrityQuery } from '@/data';
import { ArrowUpDown, Shield, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

type SortConfig = {
    key: 'department' | 'completed' | 'flagged' | 'dropped' | 'integrityRate';
    direction: 'asc' | 'desc';
};

/**
 * IntegrityAnalyticsPage displays structural metrics indicating academic honesty
 * and incident frequencies categorized by institution department.
 */
export default function IntegrityAnalyticsPage() {
    const { institutionId, isLoading: isScopeLoading } = useAcademicScope();
    const [sort, setSort] = React.useState<SortConfig>({ key: 'integrityRate', direction: 'desc' });

    // Live backend queries with institution scoping
    const { data: departmentData, isLoading: isDepartmentLoading } =
        useAnalyticsDepartmentIntegrityQuery({
            payload: { institution_id: institutionId || undefined },
            enabled: !isScopeLoading,
        });

    const items = React.useMemo(() => {
        if (!departmentData) return [];
        
        // Enrich data with a calculated integrity rate: (completed - flagged) / completed
        const enriched = departmentData.map(item => {
            const total = item.completed + item.dropped;
            const completedVal = item.completed || 1;
            const integrityRate = Math.max(
                0,
                Math.min(100, Math.round(((completedVal - (item.flagged || 0)) / completedVal) * 100))
            );
            return {
                ...item,
                integrityRate,
            };
        });

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
                return sort.direction === 'asc' 
                    ? aVal - bVal
                    : bVal - aVal;
            }
            
            return 0;
        });
    }, [departmentData, sort]);

    const handleSort = (key: SortConfig['key']) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
        }));
    };

    return (
        <AnalyticsPageShell
            title="Integrity by Department"
            description="Examine departmental statistics, session integrity rankings, and academic compliance metrics across all units."
        >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* Visual Chart */}
                <div className="lg:col-span-4">
                    {isScopeLoading || isDepartmentLoading ? (
                        <Skeleton className="h-[380px] w-full rounded-xl" />
                    ) : (
                        <DepartmentIntegrityChart data={departmentData || []} />
                    )}
                </div>

                {/* Sortable Summary Table */}
                <div className="lg:col-span-4">
                    <Card className="border-border/50 bg-card/65 backdrop-blur-md">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Department Matrix & Compliance Rankings
                                </CardTitle>
                                <CardDescription>
                                    Sorted comparison table indicating total session volume and computed academic trust indexes.
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 sm:px-6">
                            {isScopeLoading || isDepartmentLoading ? (
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-[200px] w-full" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleSort('department')}
                                                        className="hover:bg-transparent px-0 font-semibold gap-1 text-xs uppercase"
                                                    >
                                                        Department
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleSort('completed')}
                                                        className="hover:bg-transparent px-0 font-semibold gap-1 text-xs uppercase ml-auto"
                                                    >
                                                        Completed
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleSort('flagged')}
                                                        className="hover:bg-transparent px-0 font-semibold gap-1 text-xs uppercase ml-auto"
                                                    >
                                                        Flagged
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleSort('dropped')}
                                                        className="hover:bg-transparent px-0 font-semibold gap-1 text-xs uppercase ml-auto"
                                                    >
                                                        Dropped
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleSort('integrityRate')}
                                                        className="hover:bg-transparent px-0 font-semibold gap-1 text-xs uppercase ml-auto"
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
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                                        No departmental data found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                items.map((item) => (
                                                    <TableRow key={item.department} className="hover:bg-accent/20">
                                                        <TableCell className="font-semibold text-foreground">
                                                            {item.department}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1.5 font-medium">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                                <span>{item.completed}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1.5 font-medium">
                                                                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                                                <span>{item.flagged}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1.5 font-medium">
                                                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span>{item.dropped}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                                item.integrityRate >= 95
                                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                                    : item.integrityRate >= 85
                                                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                            }`}>
                                                                <Shield className="h-3 w-3" />
                                                                {item.integrityRate}%
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnalyticsPageShell>
    );
}
