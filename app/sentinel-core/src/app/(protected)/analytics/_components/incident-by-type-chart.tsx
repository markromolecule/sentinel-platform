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
    ChartConfig,
} from '@sentinel/ui';
import { IncidentByTypeChartProps } from '@sentinel/shared/types';

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

const chartConfig = {
    count: {
        label: 'Incidents',
        color: 'hsl(var(--destructive))',
    },
} satisfies ChartConfig;

/**
 * IncidentByTypeChart renders a premium horizontal bar chart mapping specific database
 * telemetry incident types to clean human-readable labels.
 *
 * @param props - Component properties containing incident type distribution array
 */
export function IncidentByTypeChart({ data }: IncidentByTypeChartProps) {
    const isMounted = useIsMounted();

    const formattedData = React.useMemo(() => {
        return data.map((item) => ({
            ...item,
            label: FRIENDLY_LABELS[item.type] || item.type,
            fill: 'var(--color-count)',
        }));
    }, [data]);

    return (
        <Card className="border-border/50 bg-card/65 col-span-2 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-base font-semibold">
                    Incidents by Violation Type
                </CardTitle>
                <CardDescription>Frequency breakdown of flagged telemetry events</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-[300px] items-center justify-center">
                    {isMounted && (
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart
                                data={formattedData}
                                layout="vertical"
                                margin={{
                                    left: 20,
                                    right: 20,
                                    top: 10,
                                    bottom: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="label"
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={11}
                                    width={120}
                                    tickFormatter={(value) =>
                                        value.length > 18 ? `${value.substring(0, 15)}...` : value
                                    }
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar dataKey="count" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
