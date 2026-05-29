'use client';

import { useIsMounted } from '@sentinel/hooks';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig,
} from '@sentinel/ui';
import { ChartProps } from '@sentinel/shared/types';

const chartConfig = {
    incidents: {
        label: 'Incidents',
        color: 'hsl(var(--destructive))',
    },
} satisfies ChartConfig;

/**
 * IncidentTrendsChart displays a line chart tracking weekly incident volume
 * over time, using shadcn ChartContainer for consistent theming.
 *
 * @param props - Component properties containing chart data array
 */
export function IncidentTrendsChart({ data }: ChartProps) {
    const isMounted = useIsMounted();

    return (
        <Card className="border-border/50 bg-card/65 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Incident Trends</CardTitle>
                <CardDescription>Weekly volume of flagged integrity incidents</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    {isMounted && (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <LineChart
                                data={data}
                                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="incidents"
                                    stroke="var(--color-incidents)"
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: 'var(--color-incidents)' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ChartContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
