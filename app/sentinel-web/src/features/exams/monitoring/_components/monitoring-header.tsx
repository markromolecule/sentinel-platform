'use client';

import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { Badge, Button } from '@sentinel/ui';
import { RefreshCw } from 'lucide-react';
import { MonitoringHeaderProps } from '@sentinel/shared/types';

function getRuntimeAccessBadgeVariant(
    state?: ExamRuntimeAccess['state'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (state) {
        case 'open':
            return 'default';
        case 'lobby_approved':
            return 'secondary';
        case 'lobby_waiting':
            return 'outline';
        case 'reopened':
            return 'secondary';
        case 'locked':
        case 'closed':
            return 'destructive';
        case 'before_start':
        default:
            return 'outline';
    }
}

function getRuntimeAccessLabel(state?: ExamRuntimeAccess['state']) {
    switch (state) {
        case 'before_start':
            return 'Before Start';
        case 'open':
            return 'Open';
        case 'lobby_approved':
            return 'Lobby Approved';
        case 'lobby_waiting':
            return 'Lobby Waiting';
        case 'locked':
            return 'Locked';
        case 'reopened':
            return 'Reopened';
        case 'closed':
            return 'Closed';
        default:
            return 'Schedule';
    }
}

export function MonitoringHeader({
    examTitle,
    examSubject,
    runtimeAccess,
    onRefresh,
    isRefreshing,
    onLock,
    onReopen,
    onReset,
    onClose,
    isUpdatingAccess,
}: MonitoringHeaderProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-foreground text-2xl font-bold">{examTitle}</h1>
                            <Badge variant={getRuntimeAccessBadgeVariant(runtimeAccess?.state)}>
                                {getRuntimeAccessLabel(runtimeAccess?.state)}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Live Monitoring • {examSubject}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-y py-4">
                <div className="space-y-2">
                    <div className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                        Exam-wide runtime access
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLock}
                            disabled={!onLock || isUpdatingAccess}
                        >
                            Lock
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onReopen}
                            disabled={!onReopen || isUpdatingAccess}
                        >
                            Reopen
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onReset}
                            disabled={!onReset || isUpdatingAccess}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onClose}
                            disabled={!onClose || isUpdatingAccess}
                        >
                            Close
                        </Button>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={!onRefresh || isRefreshing || isUpdatingAccess}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>
        </div>
    );
}
