import { HTTPException } from 'hono/http-exception';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersistableProctoringEvent } from '../ingestion.dto';
import { processQueuedTelemetryEvent } from './telemetry-job-processor.service';
import { TelemetryStorageService } from '../../storage/storage.service';

vi.mock('../../storage/storage.service', () => ({
    TelemetryStorageService: {
        appendEvent: vi.fn(),
    },
}));

const appendEventMock = vi.mocked(TelemetryStorageService.appendEvent);

const payload: PersistableProctoringEvent = {
    examSessionId: '123e4567-e89b-12d3-a456-426614174000',
    studentId: '123e4567-e89b-12d3-a456-426614174001',
    timestamp: '2026-04-20T12:32:08.451Z',
    platform: 'WEB',
    source: 'WEB_SECURITY',
    ruleKey: 'tab_switching_monitor',
    eventType: 'TAB_SWITCH',
};

describe('processQueuedTelemetryEvent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('marks successfully stored jobs as persisted', async () => {
        appendEventMock.mockResolvedValueOnce(undefined);

        await expect(processQueuedTelemetryEvent({} as never, payload)).resolves.toBe('persisted');
    });

    it('drops terminal not-found storage errors without retrying the queue job', async () => {
        appendEventMock.mockRejectedValueOnce(
            new HTTPException(404, {
                message: 'Exam session not found for telemetry ingestion.',
            }),
        );

        await expect(processQueuedTelemetryEvent({} as never, payload)).resolves.toBe('dropped');
    });

    it('drops terminal completed-session storage errors without retrying the queue job', async () => {
        appendEventMock.mockRejectedValueOnce(
            new HTTPException(409, {
                message: 'Cannot ingest telemetry for a completed exam session.',
            }),
        );

        await expect(processQueuedTelemetryEvent({} as never, payload)).resolves.toBe('dropped');
    });

    it('rethrows unexpected storage failures so the worker still surfaces real problems', async () => {
        const error = new Error('database unavailable');
        appendEventMock.mockRejectedValueOnce(error);

        await expect(processQueuedTelemetryEvent({} as never, payload)).rejects.toThrow(error);
    });
});
