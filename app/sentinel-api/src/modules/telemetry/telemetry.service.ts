import { type DbClient } from '@sentinel/db';
import type { ProctoringEventBody } from './ingestion/ingestion.dto';
import { TelemetryIngestionService } from './ingestion/ingestion.service';
import { TelemetryStorageService } from './storage/storage.service';

export class TelemetryService {
    static async ingestEvent(dbClient: DbClient, payload: ProctoringEventBody): Promise<void> {
        await TelemetryIngestionService.processEvent(dbClient, payload);
    }

    static async appendEvent(dbClient: DbClient, payload: ProctoringEventBody): Promise<void> {
        await TelemetryStorageService.appendEvent(dbClient, payload);
    }
}

export { TelemetryIngestionService } from './ingestion/ingestion.service';
export { TelemetryStorageService } from './storage/storage.service';
