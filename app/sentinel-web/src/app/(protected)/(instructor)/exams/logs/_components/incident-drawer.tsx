'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Calendar, Clock, Monitor, HardDrive, Check, X, FileText, AlertTriangle } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    Button,
    Badge,
    Textarea,
} from '@sentinel/ui';
import { type ApiIncidentLogItem } from '@sentinel/services';
import { flagLabels } from '@sentinel/shared/constants';

interface IncidentDrawerProps {
    incident: ApiIncidentLogItem | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (incidentId: string, notes: string) => Promise<void>;
    onDismiss: (incidentId: string, notes: string) => Promise<void>;
    isSubmitting: boolean;
}

function formatElapsedTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function IncidentDrawer({
    incident,
    isOpen,
    onClose,
    onConfirm,
    onDismiss,
    isSubmitting,
}: IncidentDrawerProps) {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (incident) {
            setNotes(incident.reviewNotes || '');
        } else {
            setNotes('');
        }
    }, [incident]);

    if (!incident) return null;

    const formattedType = flagLabels[incident.incidentType as keyof typeof flagLabels] || incident.incidentType.replaceAll('_', ' ');

    const handleConfirm = () => {
        void onConfirm(incident.incidentId, notes);
    };

    const handleDismiss = () => {
        void onDismiss(incident.incidentId, notes);
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md overflow-y-auto flex flex-col h-full bg-card border-l border-border p-6 scrollbar-none">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                        <span>Incident Details</span>
                    </div>
                    <SheetTitle className="text-xl font-bold text-foreground mt-2">
                        {formattedType}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground mt-1">
                        Recorded for {incident.studentName || 'Unknown Student'} ({incident.studentNo || 'No ID'})
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6">
                    {/* Severity & Status Badges */}
                    <div className="flex flex-wrap gap-2.5">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Severity</span>
                            <Badge
                                variant="outline"
                                className={
                                    incident.severity === 'HIGH'
                                        ? 'bg-red-50 border-red-200 text-red-700 font-bold uppercase dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
                                        : incident.severity === 'MEDIUM'
                                        ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold uppercase dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                                        : 'bg-blue-50 border-blue-200 text-blue-700 font-bold uppercase dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900'
                                }
                            >
                                {incident.severity || 'LOW'}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Review Status</span>
                            <Badge
                                variant="outline"
                                className={
                                    incident.status === 'CONFIRMED'
                                        ? 'bg-red-50 border-red-200 text-red-700 font-bold uppercase dark:bg-red-950/40 dark:text-red-400 dark:border-red-900'
                                        : incident.status === 'DISMISSED'
                                        ? 'bg-slate-50 border-slate-200 text-slate-700 font-bold uppercase dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800'
                                        : 'bg-yellow-50 border-yellow-200 text-yellow-700 font-bold uppercase dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900'
                                }
                            >
                                {incident.status === 'PENDING' ? 'Needs Review' : incident.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Telemetry Details */}
                    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3.5">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Telemetry Info</h4>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                    {incident.timestamp
                                        ? new Date(incident.timestamp).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                    {incident.timestamp
                                        ? new Date(incident.timestamp).toLocaleTimeString()
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Monitor className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{incident.platform || 'WEB'} Client</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <HardDrive className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">Source: {incident.source || 'CLIENT'}</span>
                            </div>
                        </div>

                        <div className="border-t border-border/60 pt-3 flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Relative Timestamp</span>
                            <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-primary shrink-0" />
                                <span>{formatElapsedTime(incident.elapsedSeconds)} elapsed</span>
                            </div>
                        </div>

                        {incident.ruleKey && (
                            <div className="border-t border-border/60 pt-3 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rule Key</span>
                                <span className="text-xs font-mono font-bold text-foreground uppercase truncate">
                                    {incident.ruleKey}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Snapshot Evidence */}
                    {incident.evidenceUrl && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Evidence Snapshot</h4>
                            <div className="relative aspect-video rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center group">
                                <img
                                    src={incident.evidenceUrl}
                                    alt="Incident Evidence Snapshot"
                                    className="object-cover h-full w-full max-h-[200px]"
                                    onError={(e) => {
                                        // If image fails to load, render placeholder
                                        e.currentTarget.style.display = 'none';
                                        const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (sibling) sibling.style.display = 'flex';
                                    }}
                                />
                                <div className="absolute inset-0 hidden flex-col items-center justify-center text-muted-foreground p-4 bg-muted/60 text-center select-none">
                                    <AlertTriangle className="h-6 w-6 text-muted-foreground mb-1.5" />
                                    <span className="text-xs font-semibold">Evidence frame unavailable</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Raw details display */}
                    {incident.details && typeof incident.details === 'object' && Object.keys(incident.details).length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Technical Context</h4>
                            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 max-h-40 overflow-y-auto font-mono text-[11px] text-muted-foreground space-y-1.5">
                                {Object.entries(incident.details).map(([key, val]) => (
                                    <div key={key} className="flex justify-between border-b border-border/40 pb-1 last:border-0 last:pb-0">
                                        <span className="font-semibold text-foreground shrink-0 mr-2">{key}:</span>
                                        <span className="truncate max-w-[240px]" title={String(val)}>{String(val)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Review Notes Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Review Notes</span>
                        </label>
                        <Textarea
                            placeholder="Add administrative notes regarding this incident review..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px] text-sm resize-none rounded-xl"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Confirm/Dismiss actions */}
                <div className="border-t border-border pt-4 mt-6 flex gap-3">
                    <Button
                        onClick={handleDismiss}
                        disabled={isSubmitting}
                        variant="outline"
                        className="flex-1 rounded-xl h-10 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                    >
                        <X className="h-4 w-4" />
                        Dismiss
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl h-10 gap-2 bg-red-600 text-white hover:bg-red-700"
                    >
                        <Check className="h-4 w-4" />
                        Confirm Violation
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
