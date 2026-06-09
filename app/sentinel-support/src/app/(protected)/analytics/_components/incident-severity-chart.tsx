'use client';

import * as React from 'react';
import { useIsMounted } from '@sentinel/hooks';
import { PieChart, Pie, Cell } from 'recharts';
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
import { IncidentSeverityDistribution } from '@sentinel/services';

export interface IncidentSeverityChartProps {
    data: (IncidentSeverityDistribution & { fill?: string })[];
}

const chartConfig = {
    HIGH: {
        label: 'High Severity',
        color: 'hsl(var(--destructive))',
    },
    MEDIUM: {
        label: 'Medium Severity',
        color: 'hsl(38 92% 50%)',
    },
    LOW: {
        label: 'Low Severity',
        color: 'hsl(var(--primary))',
    },
    high: {
        label: 'High Severity',
        color: 'hsl(var(--destructive))',
    },
    medium: {
        label: 'Medium Severity',
        color: 'hsl(38 92% 50%)',
    },
    low: {
        label: 'Low Severity',
        color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig;

/**
 * IncidentSeverityChart displays a premium donut chart showing the breakdown
 * of incident severities, styled using theme HSL color mapping variables.
 *
 * @param props - Component properties containing severity data array
 */
export function IncidentSeverityChart({ data }: IncidentSeverityChartProps) {
    const isMounted = useIsMounted();

    return (
        <Card className="border-border/50 bg-card/65 col-span-1 backdrop-blur-md">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-base font-semibold">
                    Incident Severity Proportions
                </CardTitle>
                <CardDescription>Breakdown of incident urgency levels</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="mx-auto flex aspect-square max-h-[250px] min-h-[200px] w-full items-center justify-center">
                    {isMounted && (
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-square h-full w-full"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={data}
                                    dataKey="count"
                                    nameKey="severity"
                                    innerRadius={60}
                                    outerRadius={80}
                                    strokeWidth={4}
                                    stroke="hsl(var(--card))"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                entry.fill ||
                                                `var(--color-${entry.severity.toLowerCase()})`
                                            }
                                        />
                                    ))}
                                </Pie>
                                <ChartLegend
                                    content={<ChartLegendContent nameKey="severity" />}
                                    className="-translate-y-2 flex-wrap gap-2"
                                />
                            </PieChart>
                        </ChartContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
