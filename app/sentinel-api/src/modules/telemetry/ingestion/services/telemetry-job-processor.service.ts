import type { DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import type { PersistableProctoringEvent } from '../ingestion.dto';
import { TelemetryStorageService } from '../../storage/storage.service';

export type TelemetryJobProcessingResult = 'persisted' | 'dropped';

function isTerminalTelemetryStorageError(error: unknown): error is HTTPException {
    if (!(error instanceof HTTPException)) {
        return false;
    }

    return error.status === 404 || error.status === 409;
}

export async function processQueuedTelemetryEvent(
    db: DbClient,
    payload: PersistableProctoringEvent,
): Promise<TelemetryJobProcessingResult> {
    try {
        await TelemetryStorageService.appendEvent(db, payload);
        return 'persisted';
    } catch (error) {
        if (!isTerminalTelemetryStorageError(error)) {
            throw error;
        }

        console.warn('[TelemetryWorker] Dropping terminal telemetry job.', {
            attemptId: payload.examSessionId,
            eventType: payload.eventType,
            status: error.status,
            message: error.message,
        });

        return 'dropped';
    }
}
