import { Alert, AlertDescription, AlertTitle } from '@sentinel/ui';
import { AlertTriangle, Info } from 'lucide-react';
import type { TelemetryHealthSnapshot } from '@sentinel/services';
import type { ViewProps } from '../shared/telemetry-types';
import { formatTimestamp } from '../shared/telemetry-utils';
import { StatusStrip, KeyValueList } from '../shared/status-strip';

type HealthViewProps = ViewProps & {
    health?: TelemetryHealthSnapshot;
    isHealthLoading?: boolean;
    healthError?: Error;
};

export function HealthView({
    currentDraft,
    health,
    isHealthLoading,
    healthError,
}: HealthViewProps) {
    const healthQueueDepth =
        (health?.ingestion.waiting ?? 0) +
        (health?.ingestion.active ?? 0) +
        (health?.ingestion.buffered ?? 0);
    const retainedFailedJobs = health?.ingestion.failed ?? 0;
    const hasHistoricalFailures = retainedFailedJobs > 0;
    const isQueueIdle = healthQueueDepth === 0;

    return (
        <section id="health" className="scroll-mt-24 space-y-8 py-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold tracking-tight">System Health</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Real-time status of the telemetry ingestion pipeline and worker queues.
                    </p>
                </div>

                {healthError ? (
                    <Alert className="border-destructive/30 bg-destructive/5 py-4">
                        <AlertTriangle className="text-destructive size-5" />
                        <AlertTitle className="ml-2 text-sm font-semibold">
                            Pipeline Error
                        </AlertTitle>
                        <AlertDescription className="ml-2 text-xs leading-relaxed opacity-80">
                            {healthError.message}
                        </AlertDescription>
                    </Alert>
                ) : null}

                <StatusStrip
                    items={[
                        {
                            label: 'Pipeline',
                            value: isHealthLoading ? 'Checking…' : (health?.status ?? 'Unknown'),
                            hint: 'Current ingestion state',
                        },
                        {
                            label: 'Mode',
                            value: isHealthLoading
                                ? '…'
                                : (health?.ingestion.mode?.toUpperCase() ?? 'Unknown'),
                            hint: 'Active API instance mode',
                        },
                        {
                            label: 'Total Queue',
                            value: isHealthLoading ? '…' : String(healthQueueDepth),
                            hint: 'Buffered + Active + Waiting',
                        },
                        {
                            label: 'Last Pulse',
                            value: isHealthLoading ? '…' : formatTimestamp(health?.timestamp),
                            hint: 'Health snapshot time',
                        },
                    ]}
                />
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">Operational Snapshot</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        Live queue and ingestion values from{' '}
                        <code className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-[11px]">
                            /telemetry/health
                        </code>
                        .
                    </p>
                </div>
                {hasHistoricalFailures ? (
                    <Alert className="border-amber-500/20 bg-amber-500/5 py-4">
                        <Info className="size-5 text-amber-700" />
                        <AlertTitle className="ml-2 text-sm font-semibold text-amber-900">
                            Retained Failed Jobs Detected
                        </AlertTitle>
                        <AlertDescription className="ml-2 text-xs leading-relaxed text-amber-900/80">
                            {isQueueIdle
                                ? 'The queue is currently idle, but failed jobs are still retained in BullMQ for inspection.'
                                : 'Some failed jobs are retained in BullMQ while the queue continues processing.'}{' '}
                            Treat this as historical worker output unless the count keeps rising.
                        </AlertDescription>
                    </Alert>
                ) : null}
                <div className="bg-card/50 overflow-hidden rounded-xl border">
                    <KeyValueList
                        rows={[
                            ['Requested mode', currentDraft.operations.ingestionMode],
                            ['Reported mode', health?.ingestion.mode ?? 'Unavailable'],
                            ['Queue name', health?.ingestion.queueName ?? 'Not attached'],
                            ['Buffer name', health?.ingestion.bufferName ?? 'Not attached'],
                            ['Waiting jobs', String(health?.ingestion.waiting ?? 0)],
                            ['Active jobs', String(health?.ingestion.active ?? 0)],
                            ['Buffered events', String(health?.ingestion.buffered ?? 0)],
                            ['Retained failed jobs', String(retainedFailedJobs)],
                            ['Completed jobs', String(health?.ingestion.completed ?? 0)],
                        ]}
                    />
                </div>
            </div>
        </section>
    );
}
