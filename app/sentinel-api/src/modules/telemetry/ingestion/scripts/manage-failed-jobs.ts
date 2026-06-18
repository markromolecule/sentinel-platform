import 'dotenv/config';
import { Queue } from 'bullmq';
import { closeRedisConnection, createRedisConnection } from '../../../../lib/redis/redis.service';
import { getTelemetryQueueName } from '../config/ingestion-queue.config';
import type { PersistableProctoringEvent } from '../ingestion.dto';

const TERMINAL_FAILURE_REASONS = new Set([
    'Exam session not found for telemetry ingestion.',
    'Cannot ingest telemetry for a completed exam session.',
    'Cannot ingest telemetry for a completed exam session (grace period expired).',
]);

type ScriptMode = 'summary' | 'list' | 'remove-terminal';

function getArgValue(flag: string): string | undefined {
    const index = process.argv.indexOf(flag);
    if (index === -1) {
        return undefined;
    }

    return process.argv[index + 1];
}

function hasFlag(flag: string): boolean {
    return process.argv.includes(flag);
}

function parseMode(): ScriptMode {
    const rawMode = getArgValue('--mode')?.trim().toLowerCase();

    if (rawMode === 'list' || rawMode === 'remove-terminal') {
        return rawMode;
    }

    return 'summary';
}

function parseLimit(): number {
    const parsed = Number.parseInt(getArgValue('--limit') ?? '20', 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 20;
    }

    return parsed;
}

function isDryRunEnabled(mode: ScriptMode): boolean {
    if (mode !== 'remove-terminal') {
        return true;
    }

    return !hasFlag('--apply');
}

async function main(): Promise<void> {
    const mode = parseMode();
    const limit = parseLimit();
    const queueName = getTelemetryQueueName();
    const connection = createRedisConnection('producer');
    const queue = new Queue<PersistableProctoringEvent>(queueName, {
        connection,
    });

    try {
        const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed');
        const failedJobs = await queue.getJobs(['failed'], 0, -1, false);

        const failuresByReason = failedJobs.reduce<Record<string, number>>((accumulator, job) => {
            const reason = job.failedReason || '<unknown>';
            accumulator[reason] = (accumulator[reason] ?? 0) + 1;
            return accumulator;
        }, {});

        const terminalJobs = failedJobs.filter((job) =>
            TERMINAL_FAILURE_REASONS.has(job.failedReason || ''),
        );

        if (mode === 'summary') {
            console.log(
                JSON.stringify(
                    {
                        queueName,
                        counts,
                        totalFailedJobs: failedJobs.length,
                        terminalFailedJobs: terminalJobs.length,
                        failuresByReason,
                    },
                    null,
                    2,
                ),
            );
            return;
        }

        if (mode === 'list') {
            console.log(
                JSON.stringify(
                    failedJobs.slice(0, limit).map((job) => ({
                        id: job.id,
                        name: job.name,
                        attemptsMade: job.attemptsMade,
                        failedReason: job.failedReason,
                        timestamp: job.timestamp ? new Date(job.timestamp).toISOString() : null,
                        finishedOn: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
                    })),
                    null,
                    2,
                ),
            );
            return;
        }

        const dryRun = isDryRunEnabled(mode);
        const jobsToRemove = terminalJobs.slice(0, limit);

        if (!dryRun) {
            for (const job of jobsToRemove) {
                await job.remove();
            }
        }

        console.log(
            JSON.stringify(
                {
                    queueName,
                    mode,
                    dryRun,
                    selectedJobs: jobsToRemove.length,
                    removedJobs: dryRun ? 0 : jobsToRemove.length,
                    terminalFailureReasons: Array.from(TERMINAL_FAILURE_REASONS),
                    selectedJobIds: jobsToRemove.map((job) => String(job.id)),
                },
                null,
                2,
            ),
        );
    } finally {
        await queue.close();
        await closeRedisConnection(connection);
    }
}

void main().catch((error) => {
    console.error('[TelemetryQueue] Failed to manage failed jobs.', error);
    process.exit(1);
});
