import { Badge, Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';
import type { ExamReport } from '@sentinel/shared/types';

interface IncidentBreakdownProps {
    summary: ExamReport['summary'];
}

export function IncidentBreakdown({ summary }: IncidentBreakdownProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Incident Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                    <h3 className="text-muted-foreground text-sm font-medium">By Type</h3>
                    {summary.incidentBreakdownByType.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No incidents were recorded for this exam.
                        </p>
                    ) : (
                        summary.incidentBreakdownByType.map((item) => (
                            <div
                                key={item.type}
                                className="border-border/70 flex items-center justify-between rounded-lg border px-3 py-2"
                            >
                                <span className="text-sm font-medium">
                                    {item.type.replaceAll('_', ' ')}
                                </span>
                                <Badge variant="secondary">{item.count}</Badge>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-3">
                    <h3 className="text-muted-foreground text-sm font-medium">By Severity</h3>
                    {summary.incidentBreakdownBySeverity.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No severity data is available for this exam.
                        </p>
                    ) : (
                        summary.incidentBreakdownBySeverity.map((item) => (
                            <div
                                key={item.severity}
                                className="border-border/70 flex items-center justify-between rounded-lg border px-3 py-2"
                            >
                                <span className="text-sm font-medium capitalize">
                                    {item.severity}
                                </span>
                                <Badge variant="secondary">{item.count}</Badge>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
