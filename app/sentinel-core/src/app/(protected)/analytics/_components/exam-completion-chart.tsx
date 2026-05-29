'use client';

import { useIsMounted } from '@sentinel/hooks';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
import { ChartProps } from '@sentinel/shared/types';

const chartConfig = {
    completed: {
        label: 'Completed',
        color: 'hsl(var(--primary))',
    },
    dropped: {
        label: 'Dropped',
        color: 'hsl(var(--destructive))',
    },
} satisfies ChartConfig;

/**
 * ExamCompletionChart displays a grouped bar chart showing daily completed
 * vs dropped exam session counts using shadcn ChartContainer for consistent theming.
 *
 * @param props - Component properties containing chart data array
 */
export function ExamCompletionChart({ data }: ChartProps) {
    const isMounted = useIsMounted();

    return (
        <Card className="border-border/50 bg-card/65 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Exam Completion Rates</CardTitle>
                <CardDescription>Daily breakdown of completed vs dropped exams</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    {isMounted && (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart
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
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                                    content={<ChartTooltipContent />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="completed"
                                    fill="var(--color-completed)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="dropped"
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
