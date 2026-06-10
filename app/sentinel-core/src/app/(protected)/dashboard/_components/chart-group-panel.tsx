'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@sentinel/ui';
import { ExamCompletionChart } from '@/app/(protected)/analytics/_components/exam-completion-chart';
import { IncidentTrendsChart } from '@/app/(protected)/analytics/_components/incident-trends-chart';
import { ChartProps } from '@sentinel/shared/types';

interface ChartGroupPanelProps {
    examData: ChartProps['data'];
    incidentData: ChartProps['data'];
}

/**
 * Groups the Exam Completion and Incident Trends charts into a single tabbed panel.
 * Helps optimize dashboard space by allowing administrators to switch between datasets.
 *
 * @param props.examData Data for the exam completion bar chart.
 * @param props.incidentData Data for the incident trends line chart.
 */
export function ChartGroupPanel({ examData, incidentData }: ChartGroupPanelProps) {
    return (
        <Tabs defaultValue="completion" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 gap-2">
                <div>
                    <h3 className="text-lg font-semibold">Analytics Overview</h3>
                    <p className="text-sm text-muted-foreground">
                        System completion and integrity trend data
                    </p>
                </div>
                <TabsList className="grid w-[300px] grid-cols-2">
                    <TabsTrigger value="completion">Exam Completion</TabsTrigger>
                    <TabsTrigger value="incidents">Incident Trends</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="completion" className="outline-none mt-0">
                <ExamCompletionChart data={examData} />
            </TabsContent>
            <TabsContent value="incidents" className="outline-none mt-0">
                <IncidentTrendsChart data={incidentData} />
            </TabsContent>
        </Tabs>
    );
}
