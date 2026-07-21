import { describe, expect, it, vi } from 'vitest';
import {
    acknowledgeLiveInspectionPublisherFailure,
    acknowledgeLiveInspectionPublisherReady,
    createLiveInspectionPublisherConnection,
    createLiveInspectionViewerConnection,
    getLiveInspectionStatus,
    getStudentLiveInspectionDirective,
    startLiveInspection,
    stopLiveInspection,
} from './live-inspection';

describe('live inspection service client', () => {
    it('uses exact staff paths and bodies', async () => {
        const apiClient = vi.fn().mockResolvedValue({ data: { leaseId: 'lease-1' } });

        await startLiveInspection(apiClient as any, { examId: 'exam-1', attemptId: 'attempt-1' });
        await getLiveInspectionStatus(apiClient as any, {
            examId: 'exam-1',
            attemptId: 'attempt-1',
        });
        await createLiveInspectionViewerConnection(apiClient as any, {
            examId: 'exam-1',
            leaseId: 'lease-1',
        });
        await stopLiveInspection(apiClient as any, { examId: 'exam-1', leaseId: 'lease-1' });

        expect(apiClient).toHaveBeenNthCalledWith(1, '/exams/exam-1/monitoring/live-inspections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attemptId: 'attempt-1' }),
        });
        expect(apiClient).toHaveBeenNthCalledWith(
            2,
            '/exams/exam-1/monitoring/live-inspections/status?attemptId=attempt-1',
        );
        expect(apiClient).toHaveBeenNthCalledWith(
            3,
            '/exams/exam-1/monitoring/live-inspections/lease-1/viewer-connection',
            { method: 'POST' },
        );
        expect(apiClient).toHaveBeenNthCalledWith(
            4,
            '/exams/exam-1/monitoring/live-inspections/lease-1/stop',
            { method: 'POST' },
        );
    });

    it('uses exact student paths and never sends student user ids', async () => {
        const apiClient = vi.fn().mockResolvedValue({ data: {} });

        await getStudentLiveInspectionDirective(apiClient as any, { sessionId: 'session-1' });
        await createLiveInspectionPublisherConnection(apiClient as any, {
            sessionId: 'session-1',
            leaseId: 'lease-1',
            revision: 2,
        });
        await acknowledgeLiveInspectionPublisherReady(apiClient as any, {
            sessionId: 'session-1',
            leaseId: 'lease-1',
            revision: 3,
        });
        await acknowledgeLiveInspectionPublisherFailure(apiClient as any, {
            sessionId: 'session-1',
            leaseId: 'lease-1',
            revision: 3,
            errorCode: 'CAMERA_DENIED',
        });

        const serializedCalls = JSON.stringify(apiClient.mock.calls);

        expect(apiClient).toHaveBeenNthCalledWith(
            1,
            '/examination/flow/live-inspections/directive',
            expect.objectContaining({ body: JSON.stringify({ sessionId: 'session-1' }) }),
        );
        expect(apiClient).toHaveBeenNthCalledWith(
            2,
            '/examination/flow/live-inspections/publisher-connection',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    sessionId: 'session-1',
                    leaseId: 'lease-1',
                    revision: 2,
                }),
            }),
        );
        expect(serializedCalls).not.toContain('studentUserId');
    });
});
