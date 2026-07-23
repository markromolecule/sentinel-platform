import { type DbClient } from '@sentinel/db';
import type {
    BatchProctoringEventBody,
    PersistableProctoringEvent,
    ProctoringEventBody,
} from './ingestion.dto';
import { telemetryIngestionQueueService } from './services/ingestion-queue.service';
import { telemetryPolicyService } from './services/telemetry-policy.service';
import { telemetrySettingsResolverService } from '../settings/telemetry-settings-resolver.service';

import type { TelemetryQueueMode } from './config/ingestion-queue.config';

export class TelemetryIngestionService {
    /**
     * Process an incoming telemetry event.
     * This acts as the buffer/orchestrator before hitting the append-only storage tier.
     * `sync` mode writes inline, while `redis` mode hands work off to BullMQ workers.
     */
    static async processEvent(
        db: DbClient,
        payload: ProctoringEventBody,
    ): Promise<{ mode: TelemetryQueueMode; jobId?: string } | null> {
        const resolvedSettingsRecord = await telemetrySettingsResolverService.resolve(db);
        const settingsRecord =
            resolvedSettingsRecord.updatedAt === null ? undefined : resolvedSettingsRecord;

        if (settingsRecord && !settingsRecord.value.operations.enabled) {
            console.log('[TelemetryIngestion] Event ignored: telemetry disabled globally', {
                attemptId: payload.examSessionId,
                eventType: payload.eventType,
                settingsVersion: settingsRecord.value.version,
            });
            return null;
        }

        console.log('[TelemetryIngestion] Received event', {
            attemptId: payload.examSessionId,
            eventType: payload.eventType,
            platform: payload.platform,
            settingsVersion: settingsRecord?.value.version ?? null,
        });

        const decision = await telemetryPolicyService.filterImportantEvent(
            db,
            payload,
            settingsRecord,
        );

        if (decision.action === 'ignore') {
            return null;
        }

        console.log('[TelemetryIngestion] Submitting event to queue', {
            attemptId: payload.examSessionId,
            eventType: decision.payload.eventType,
            platform: decision.payload.platform,
            settingsVersion: settingsRecord?.value.version ?? null,
        });

        return await telemetryIngestionQueueService.submit(db, decision.payload, {
            operations: settingsRecord?.value.operations,
        });
    }

    /**
     * Process a batch of telemetry events.
     * Buffers all persistent events into a Redis list for high-throughput cron flushing.
     */
    static async processBatch(db: DbClient, payloads: BatchProctoringEventBody): Promise<void> {
        const resolvedSettingsRecord = await telemetrySettingsResolverService.resolve(db);
        const settingsRecord =
            resolvedSettingsRecord.updatedAt === null ? undefined : resolvedSettingsRecord;

        if (settingsRecord && !settingsRecord.value.operations.enabled) {
            console.log('[TelemetryIngestion] Batch ignored: telemetry disabled globally', {
                eventCount: payloads.length,
                attemptId: payloads[0]?.examSessionId,
                settingsVersion: settingsRecord.value.version,
            });
            return;
        }

        console.log('[TelemetryIngestion] Received batch', {
            eventCount: payloads.length,
            attemptId: payloads[0]?.examSessionId,
            settingsVersion: settingsRecord?.value.version ?? null,
        });

        const persistableEvents: PersistableProctoringEvent[] = [];

        // Apply policy filtering to each event in the batch
        for (const payload of payloads) {
            const decision = await telemetryPolicyService.filterImportantEvent(
                db,
                payload,
                settingsRecord,
            );
            if (decision.action === 'persist') {
                persistableEvents.push(decision.payload);
            }
        }

        if (persistableEvents.length === 0) {
            return;
        }

        console.log('[TelemetryIngestion] Buffering batch events', {
            count: persistableEvents.length,
            attemptId: persistableEvents[0]?.examSessionId,
            settingsVersion: settingsRecord?.value.version ?? null,
            batchingEnabled: settingsRecord?.value.operations.batchingEnabled ?? null,
            maxBatchSize: settingsRecord?.value.operations.maxBatchSize ?? null,
        });

        // Use the buffer path instead of BullMQ for high-frequency batch data
        await telemetryIngestionQueueService.bufferBatch(db, persistableEvents, {
            operations: settingsRecord?.value.operations,
        });
    }
}
