'use client';

import { FileText, RefreshCw, User } from 'lucide-react';
import { useActivityLogsQuery } from '@sentinel/hooks';
import { Badge, Card, CardContent, CardHeader, Spinner } from '@sentinel/ui';

/**
 * SupportActivityFeedWidget renders a compact feed of the most recent
 * operational activity logs performed in the system.
 */
export function SupportActivityFeedWidget() {
    const { data, isLoading, isRefetching, refetch } = useActivityLogsQuery({
        params: { pageSize: 5 },
    });

    const items = data?.items ?? [];

    const getRelativeTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMin / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMin < 1) return 'Just now';
            if (diffMin < 60) return `${diffMin}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${diffDays}d ago`;
        } catch {
            return 'N/A';
        }
    };

    return (
        <Card className="border border-slate-100 shadow-xs dark:border-slate-800">
            <CardHeader className="border-b border-slate-50 px-6 py-4 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            System Activity Feed
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {data && (
                            <Badge variant="secondary" className="h-5 text-[10px] font-semibold">
                                {data.total ?? 0} Events
                            </Badge>
                        )}
                        <button
                            onClick={() => void refetch()}
                            disabled={isLoading || isRefetching}
                            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors disabled:opacity-50"
                            aria-label="Refresh activity feed"
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
                {isLoading ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 py-6">
                        <Spinner className="text-primary size-6" />
                        <p className="text-xs text-slate-400">Loading activity...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                        No recent system activity recorded.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                        {items.map((log) => {
                            const name = [log.userFirstName, log.userLastName]
                                .filter(Boolean)
                                .join(' ')
                                .trim();
                            const actorName = name || log.userId || 'System';

                            return (
                                <div
                                    key={log.logId}
                                    className="flex flex-col gap-1.5 p-4 text-xs transition-colors hover:bg-slate-50/40 dark:hover:bg-slate-900/10"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                <User className="h-3 w-3" />
                                            </div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                {actorName}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400">
                                            {getRelativeTime(log.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 pl-7">
                                        <span className="font-medium text-slate-600 dark:text-slate-400">
                                            {log.action}
                                        </span>
                                        {log.resourceType && (
                                            <Badge
                                                variant="outline"
                                                className="border-slate-200/60 bg-slate-50/40 px-1 py-0 font-mono text-[9px] font-medium text-slate-500 lowercase dark:border-slate-800 dark:bg-slate-900/30"
                                            >
                                                {log.resourceType}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
