'use client';

import { Card, CardContent, CardHeader } from '@sentinel/ui';
import { Badge } from '@sentinel/ui';
import { AlertTriangle, Eye, Clock } from 'lucide-react';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@sentinel/ui';
import { FlaggedIncident } from '@sentinel/shared/types';
import {
    INCIDENT_LABELS as incidentLabels,
    MOCK_FLAGGED_INCIDENTS,
} from '@sentinel/shared/mock-data';

export function FlaggedIncidentsWidget() {
    const getSeverityBadge = (severity: FlaggedIncident['severity']) => {
        switch (severity) {
            case 'high':
                return (
                    <Badge variant="destructive" className="h-5 px-1.5 py-0 text-[10px]">
                        High
                    </Badge>
                );
            case 'medium':
                return (
                    <Badge className="h-5 bg-orange-500 px-1.5 py-0 text-[10px] hover:bg-orange-600">
                        Medium
                    </Badge>
                );
            case 'low':
                return (
                    <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px]">
                        Low
                    </Badge>
                );
        }
    };

    const pendingCount = MOCK_FLAGGED_INCIDENTS.filter((i) => i.status === 'pending').length;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive h-4 w-4" />
                    <h3 className="text-sm font-semibold">Flagged Incidents</h3>
                </div>
                <Badge variant="destructive" className="h-5 text-xs">
                    {pendingCount} Pending
                </Badge>
            </CardHeader>
            <CardContent className="px-0 py-0">
                <div className="divide-y">
                    {MOCK_FLAGGED_INCIDENTS.map((incident) => (
                        <div
                            key={incident.id}
                            className="hover:bg-muted/50 flex items-center justify-between p-3 text-sm transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{incident.studentName}</span>
                                        {getSeverityBadge(incident.severity)}
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                                        <span>{incidentLabels[incident.incidentType]}</span>
                                        <span>•</span>
                                        <span>{incident.examName}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {incident.timestamp}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 text-xs">
                                        <Eye className="mr-1 h-3 w-3" />
                                        Review
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Incident Review</DialogTitle>
                                        <DialogDescription>
                                            Review the flagged activity for {incident.studentName}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-muted-foreground text-xs font-semibold uppercase">
                                                    Violation Type
                                                </span>
                                                <span className="flex items-center gap-2 text-sm font-medium">
                                                    {incidentLabels[incident.incidentType]}
                                                    {getSeverityBadge(incident.severity)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 text-right">
                                                <span className="text-muted-foreground text-xs font-semibold uppercase">
                                                    Timestamp
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {incident.timestamp}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-muted group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border">
                                            <div className="text-muted-foreground flex flex-col items-center gap-2">
                                                <AlertTriangle className="h-8 w-8 opacity-50" />
                                                <span className="text-xs">
                                                    Snapshot Evidence Placeholder
                                                </span>
                                            </div>
                                            {/* Mock overlay for multiple faces */}
                                            {incident.incidentType === 'MULTIPLE_FACES' && (
                                                <div className="absolute inset-0 border-4 border-red-500/50 bg-red-500/10" />
                                            )}
                                        </div>

                                        <div className="text-muted-foreground text-sm">
                                            <p>
                                                Session ID:{' '}
                                                <span className="font-mono text-xs">
                                                    SES-{incident.id.split('-')[1]}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <Button
                                            variant="outline"
                                            onClick={() => console.log('Dismissed')}
                                        >
                                            Dismiss as False Positive
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => console.log('Confirmed')}
                                        >
                                            Confirm Violation
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
