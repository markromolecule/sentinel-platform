import { type DbClient } from '@sentinel/db';
import type {
    BatchProctoringEventBody,
    PersistableProctoringEvent,
    ProctoringEventBody,
} from './ingestion.dto';
import { telemetryIngestionQueueService } from './services/ingestion-queue.service';
import { telemetryPolicyService } from './services/telemetry-policy.service';

export class TelemetryIngestionService {
    /**
     * Process an incoming telemetry event.
     * This acts as the buffer/orchestrator before hitting the append-only storage tier.
     * `sync` mode writes inline, while `redis` mode hands work off to BullMQ workers.
     */
    static async processEvent(db: DbClient, payload: ProctoringEventBody): Promise<void> {
        console.log('[TelemetryIngestion] Received event', {
            attemptId: payload.examSessionId,
            eventType: payload.eventType,
            platform: payload.platform,
        });

        const decision = await telemetryPolicyService.filterImportantEvent(db, payload);

        if (decision.action === 'ignore') {
            return;
        }

        console.log('[TelemetryIngestion] Submitting event to queue', {
            attemptId: payload.examSessionId,
            eventType: decision.payload.eventType,
            platform: decision.payload.platform,
        });

        await telemetryIngestionQueueService.submit(db, decision.payload);
    }

    /**
     * Process a batch of telemetry events.
     * Buffers all persistent events into a Redis list for high-throughput cron flushing.
     */
    static async processBatch(db: DbClient, payloads: BatchProctoringEventBody): Promise<void> {
        console.log('[TelemetryIngestion] Received batch', {
            eventCount: payloads.length,
            attemptId: payloads[0]?.examSessionId,
        });

        const persistableEvents: PersistableProctoringEvent[] = [];

        // Apply policy filtering to each event in the batch
        for (const payload of payloads) {
            const decision = await telemetryPolicyService.filterImportantEvent(db, payload);
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
        });

        // Use the buffer path instead of BullMQ for high-frequency batch data
        await telemetryIngestionQueueService.bufferBatch(db, persistableEvents);
    }
}
