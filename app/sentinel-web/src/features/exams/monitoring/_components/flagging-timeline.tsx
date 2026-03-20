"use client";

import { cn } from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { Eye, Clock, AlertCircle } from "lucide-react";
import { Flag } from '@sentinel/shared/types';
import { flagIcons, flagLabels } from '@sentinel/shared/constants';

interface FlaggingTimelineProps {
    flags: Flag[];
}

export function FlaggingTimeline({ flags }: FlaggingTimelineProps) {
    if (flags.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-xl border border-dashed border-border/60">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <AlertCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">All Clear</h4>
                <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                    No flagging events recorded for this session yet.
                </p>
            </div>
        );
    }

    return (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#323d8f]/20 before:via-border before:to-transparent">
            {flags.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((flag) => (
                <div key={flag.id} className="relative flex items-start gap-6 group">
                    {/* Timeline dot/icon */}
                    <div className={cn(
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-transform group-hover:scale-110 shadow-sm",
                        flag.severity === 'high' ? "border-red-500 text-red-500" :
                        flag.severity === 'medium' ? "border-orange-500 text-orange-500" :
                        "border-blue-500 text-blue-500"
                    )}>
                        {flagIcons[flag.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                {flagLabels[flag.type]}
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                    flag.severity === 'high' ? "bg-red-100 text-red-600" :
                                    flag.severity === 'medium' ? "bg-orange-100 text-orange-600" :
                                    "bg-blue-100 text-blue-600"
                                )}>
                                    {flag.severity}
                                </span>
                            </h4>
                            <div className="flex items-center text-xs text-muted-foreground font-medium">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(flag.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 group-hover:border-border/80 transition-colors">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {flag.description}
                            </p>
                            
                            {flag.snapshotUrl && (
                                <div className="mt-4 flex flex-col gap-3">
                                    <div className="relative aspect-video rounded-lg overflow-hidden border border-border/60 bg-muted/50 group-hover:border-border/80 transition-colors">
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm" className="shadow-lg h-8">
                                                <Eye className="w-3.5 h-3.5 mr-2" />
                                                View Full Size
                                            </Button>
                                        </div>
                                        {/* In a real app, this would be the actual image */}
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-[10px] font-mono text-muted-foreground uppercase opacity-40">
                                                Snapshot: {flag.id.slice(0, 8)}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="self-start h-8 px-3 text-xs text-[#323d8f] hover:text-[#323d8f] hover:bg-[#323d8f]/5">
                                        <Eye className="w-3.5 h-3.5 mr-2" />
                                        Analyze Frame
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
