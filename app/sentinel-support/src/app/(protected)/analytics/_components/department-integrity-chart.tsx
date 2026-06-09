'use client';

import * as React from 'react';
import { useIsMounted } from '@sentinel/hooks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartConfig,
} from '@sentinel/ui';
import { DepartmentIntegrityMetric } from '@sentinel/services';

export interface DepartmentIntegrityChartProps {
    data: DepartmentIntegrityMetric[];
}

const chartConfig = {
    completed: {
        label: 'Completed',
        color: 'hsl(var(--primary))',
    },
    flagged: {
        label: 'Flagged',
        color: 'hsl(var(--destructive))',
    },
    dropped: {
        label: 'Dropped',
        color: 'hsl(var(--muted-foreground))',
    },
} satisfies ChartConfig;

/**
 * DepartmentIntegrityChart displays a stacked vertical bar chart showing
 * session completion, dropped rate, and flagged incidents across college departments.
 *
 * @param props - Component properties containing department integrity data array
 */
export function DepartmentIntegrityChart({ data }: DepartmentIntegrityChartProps) {
    const isMounted = useIsMounted();

    return (
        <Card className="border-border/50 bg-card/65 col-span-2 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-base font-semibold">
                    Department Integrity Distribution
                </CardTitle>
                <CardDescription>
                    Academic comparison of completed, dropped, and flagged exam sessions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    {isMounted && (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart
                                data={data}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 10,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="department"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="completed"
                                    stackId="a"
                                    fill="var(--color-completed)"
                                    radius={[0, 0, 0, 0]}
                                />
                                <Bar
                                    dataKey="flagged"
                                    stackId="a"
                                    fill="var(--color-flagged)"
                                    radius={[0, 0, 0, 0]}
                                />
                                <Bar
                                    dataKey="dropped"
                                    stackId="a"
                                    fill="var(--color-dropped)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
