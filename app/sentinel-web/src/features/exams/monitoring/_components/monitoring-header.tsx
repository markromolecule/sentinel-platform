'use client';

import Link from 'next/link';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { Badge, Button } from '@sentinel/ui';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { MonitoringHeaderProps } from '@sentinel/shared/types';

function getRuntimeAccessBadgeVariant(
    state?: ExamRuntimeAccess['state'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (state) {
        case 'open':
            return 'default';
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/exams">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-foreground text-2xl font-bold">{examTitle}</h1>
                        <Badge variant={getRuntimeAccessBadgeVariant(runtimeAccess?.state)}>
                            {getRuntimeAccessLabel(runtimeAccess?.state)}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">Live Monitoring • {examSubject}</p>
                    {runtimeAccess?.message ? (
                        <p className="text-muted-foreground mt-2 text-sm">
                            {runtimeAccess.message}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:ml-auto lg:justify-end">
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
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={!onRefresh || isRefreshing || isUpdatingAccess}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
        </div>
    );
}
