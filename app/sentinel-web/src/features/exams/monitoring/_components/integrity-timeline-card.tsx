"use client";

import { Flag } from '@sentinel/shared/types';
import { Card, Button } from "@sentinel/ui";
import { FlaggingTimeline } from "./flagging-timeline";

interface IntegrityTimelineCardProps {
    flags: Flag[];
}

export function IntegrityTimelineCard({ flags }: IntegrityTimelineCardProps) {
    return (
        <Card className="h-full border-border/50 shadow-sm flex flex-col overflow-hidden bg-card rounded-xl p-0 gap-0">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/5 shrink-0">
                <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-foreground">Integrity Timeline</h3>
                    <p className="text-xs text-muted-foreground">Chronological log of flagged incidents</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-bold text-[#323d8f]">
                        Refresh
                    </Button>
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border-muted hover:scrollbar-thumb-border transition-colors">
                <div className="p-6">
                    <FlaggingTimeline flags={flags} />
                </div>
            </div>
        </Card>
    );
}
