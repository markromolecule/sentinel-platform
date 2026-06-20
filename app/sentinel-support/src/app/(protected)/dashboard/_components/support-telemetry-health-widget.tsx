'use client';

import { Activity, RefreshCw } from 'lucide-react';
import { useTelemetryHealthQuery } from '@sentinel/hooks';
import { Badge, Card, CardContent, CardHeader, Spinner } from '@sentinel/ui';

/**
 * SupportTelemetryHealthWidget displays a compact, live status snapshot of the
 * system's telemetry data ingestion queue and processing health.
 */
export function SupportTelemetryHealthWidget() {
    const { data: health, isLoading, isRefetching, refetch } = useTelemetryHealthQuery();

    const isHealthy =
        health?.status?.toLowerCase() === 'healthy' || health?.status?.toLowerCase() === 'ok';

    return (
        <Card className="border border-slate-100 shadow-xs dark:border-slate-800">
            <CardHeader className="border-b border-slate-50 px-6 py-4 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="text-muted-foreground h-4 w-4" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Telemetry Health
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {health && (
                            <Badge
                                variant={isHealthy ? 'outline' : 'destructive'}
                                className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold ${
                                    isHealthy
                                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400'
                                        : ''
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        isHealthy ? 'animate-pulse bg-green-500' : 'bg-red-500'
                                    }`}
                                />
                                {health.status || 'Unknown'}
                            </Badge>
                        )}
                        <button
                            onClick={() => void refetch()}
                            disabled={isLoading || isRefetching}
                            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors disabled:opacity-50"
                            aria-label="Refresh telemetry health"
                        >
                            <RefreshCw
                                className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {isLoading ? (
                    <div className="flex h-36 flex-col items-center justify-center gap-2 py-4">
                        <Spinner className="text-primary size-6" />
                        <p className="text-xs text-slate-400">Loading metrics...</p>
                    </div>
                ) : !health ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                        Telemetry health data unavailable.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Mode and Ingestion details */}
                        <div className="flex items-center justify-between rounded-lg border border-slate-100/50 bg-slate-50/50 px-3 py-2 text-xs dark:border-slate-800/40 dark:bg-slate-900/20">
                            <span className="font-medium text-slate-500">Ingestion Mode</span>
                            <span className="font-semibold text-slate-700 uppercase dark:text-slate-300">
                                {health.ingestion.mode || 'N/A'}
                            </span>
                        </div>

                        {/* Queue Counts Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-3 text-center dark:border-slate-800/60 dark:bg-slate-900/10">
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Active
                                </p>
                                <p className="mt-1 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                                    {health.ingestion.active ?? 0}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-3 text-center dark:border-slate-800/60 dark:bg-slate-900/10">
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Waiting
                                </p>
                                <p className="mt-1 text-xl font-extrabold text-amber-600 dark:text-amber-400">
                                    {health.ingestion.waiting ?? 0}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-3 text-center dark:border-slate-800/60 dark:bg-slate-900/10">
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Completed
                                </p>
                                <p className="mt-1 text-xl font-extrabold text-green-600 dark:text-green-400">
                                    {health.ingestion.completed ?? 0}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-3 text-center dark:border-slate-800/60 dark:bg-slate-900/10">
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    Failed
                                </p>
                                <p className="mt-1 text-xl font-extrabold text-red-600 dark:text-red-400">
                                    {health.ingestion.failed ?? 0}
                                </p>
                            </div>
                        </div>

                        {health.ingestion.buffered !== undefined && (
                            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                                <span>
                                    Buffer Name:{' '}
                                    <strong className="font-medium text-slate-500 dark:text-slate-300">
                                        {health.ingestion.bufferName || 'None'}
                                    </strong>
                                </span>
                                <span>
                                    Buffered events:{' '}
                                    <strong className="font-semibold text-slate-500 dark:text-slate-300">
                                        {health.ingestion.buffered}
                                    </strong>
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
