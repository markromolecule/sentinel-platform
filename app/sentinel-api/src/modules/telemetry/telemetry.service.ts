import { type DbClient } from '@sentinel/db';
import type { ProctoringEventBody } from './ingestion/ingestion.dto';
import { TelemetryIngestionService } from './ingestion/ingestion.service';
import { TelemetryStorageService } from './storage/storage.service';

import type { TelemetryQueueMode } from './ingestion/config/ingestion-queue.config';

export class TelemetryService {
    static async ingestEvent(
        dbClient: DbClient,
        payload: ProctoringEventBody,
    ): Promise<{ mode: TelemetryQueueMode; jobId?: string } | null> {
        return await TelemetryIngestionService.processEvent(dbClient, payload);
    }

    static async appendEvent(dbClient: DbClient, payload: ProctoringEventBody): Promise<void> {
        await TelemetryStorageService.appendEvent(dbClient, payload);
    }
}

export { TelemetryIngestionService } from './ingestion/ingestion.service';
export { TelemetryStorageService } from './storage/storage.service';
