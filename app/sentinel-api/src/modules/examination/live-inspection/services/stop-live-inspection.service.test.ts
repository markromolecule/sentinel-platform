import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { stopLiveInspection } from './stop-live-inspection.service';
import type { LiveKitConfig } from '../../../infrastructure/livekit/livekit.config';
import * as repository from '../live-inspection.repository';
import * as accessService from '../live-inspection-access.service';
import * as stateService from '../live-inspection-state.service';
import { LiveKitService } from '../../../infrastructure/livekit/livekit.service';

vi.mock('../live-inspection.repository');
vi.mock('../live-inspection-access.service');
vi.mock('../live-inspection-state.service');
vi.mock('../../../infrastructure/livekit/livekit.service');

const enabledConfig: LiveKitConfig = {
    enabled: true,
    allowedInstitutionIds: [],
    liveKitUrl: 'wss://livekit.test',
    apiKey: 'key',
    apiSecret: 'secret',
    requestTimeoutMs: 20_000,
    viewerJoinTimeoutMs: 15_000,
    maxInspectionDurationSeconds: 300,
    tokenTtlSeconds: 60,
    roomEmptyTimeoutSeconds: 30,
    roomDepartureTimeoutSeconds: 10,
    globalActiveInspectionLimit: 20,
    institutionActiveInspectionLimit: 10,
};

const mockLease = {
    lease_id: 'lease-123',
    exam_id: 'exam-123',
    attempt_id: 'attempt-123',
    student_user_id: 'student-123',
    viewer_user_id: 'viewer-123',
    institution_id: 'inst-123',
    provider_room_name: 'room-123',
    state: 'REQUESTED',
    version: 1,
    requested_at: new Date('2026-07-23T12:00:00Z'),
    expires_at: new Date('2026-07-23T12:05:00Z'),
    started_at: null,
    ended_at: null,
    end_reason: null,
    last_error_code: null,
};

describe('stopLiveInspection', () => {
    let mockLiveKit: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockLiveKit = {
            removeParticipant: vi.fn().mockResolvedValue({}),
            deleteInspectionRoom: vi.fn().mockResolvedValue({}),
        };
    });

    it('returns terminal lease immediately without cleanup or update', async () => {
        const terminalLease = { ...mockLease, state: 'ENDED', end_reason: 'VIEWER_STOPPED' };
        vi.mocked(repository.getLiveInspectionLeaseForViewer).mockResolvedValue(terminalLease as any);

        const result = await stopLiveInspection(
            {
                dbClient: {} as any,
                examId: 'exam-123',
                leaseId: 'lease-123',
                viewerUserId: 'viewer-123',
                role: 'instructor',
                activeInstitutionId: 'inst-123',
            },
            { config: enabledConfig, liveKit: mockLiveKit },
        );

        expect(result.state).toBe('ENDED');
        expect(repository.compareAndSetLiveInspectionLeaseState).not.toHaveBeenCalled();
        expect(mockLiveKit.removeParticipant).not.toHaveBeenCalled();
    });

    it('moves REQUESTED lease to STOPPING, performs cleanup, terminalizes, logs lifecycle, and returns ENDED', async () => {
        const requestedLease = { ...mockLease, state: 'REQUESTED', version: 1 };
        const stoppingLease = { ...requestedLease, state: 'STOPPING', version: 2 };
        const endedLease = { ...stoppingLease, state: 'ENDED', version: 3, end_reason: 'VIEWER_STOPPED' };

        vi.mocked(repository.getLiveInspectionLeaseForViewer).mockResolvedValue(requestedLease as any);
        vi.mocked(repository.compareAndSetLiveInspectionLeaseState).mockResolvedValue(stoppingLease as any);
        vi.mocked(stateService.terminalizeLiveInspectionLeaseState).mockResolvedValue(endedLease as any);

        const result = await stopLiveInspection(
            {
                dbClient: {} as any,
                examId: 'exam-123',
                leaseId: 'lease-123',
                viewerUserId: 'viewer-123',
                role: 'instructor',
                activeInstitutionId: 'inst-123',
            },
            { config: enabledConfig, liveKit: mockLiveKit },
        );

        expect(result.state).toBe('ENDED');
        expect(repository.compareAndSetLiveInspectionLeaseState).toHaveBeenCalledWith(
            expect.any(Object),
            'lease-123',
            { fromState: 'REQUESTED', toState: 'STOPPING', expectedVersion: 1 }
        );
        expect(mockLiveKit.removeParticipant).toHaveBeenCalledTimes(2);
        expect(mockLiveKit.deleteInspectionRoom).toHaveBeenCalledWith('room-123');
        expect(stateService.terminalizeLiveInspectionLeaseState).toHaveBeenCalledWith({
            dbClient: expect.any(Object),
            leaseId: 'lease-123',
            state: 'ENDED',
            endReason: 'VIEWER_STOPPED',
            lastErrorCode: null,
        });
        expect(LiveKitService.logLiveInspectionLifecycleEvent).toHaveBeenCalled();
    });

    it('converges successfully when compare-and-set conflicts once and succeeds on retry', async () => {
        const requestedLease1 = { ...mockLease, state: 'REQUESTED', version: 1 };
        const requestedLease2 = { ...mockLease, state: 'REQUESTED', version: 2 };
        const stoppingLease = { ...mockLease, state: 'STOPPING', version: 3 };
        const endedLease = { ...stoppingLease, state: 'ENDED', version: 4, end_reason: 'VIEWER_STOPPED' };

        vi.mocked(repository.getLiveInspectionLeaseForViewer)
            .mockResolvedValueOnce(requestedLease1 as any)
            .mockResolvedValueOnce(requestedLease2 as any);

        vi.mocked(repository.compareAndSetLiveInspectionLeaseState)
            .mockResolvedValueOnce(undefined) // conflict first
            .mockResolvedValueOnce(stoppingLease as any); // success second

        vi.mocked(stateService.terminalizeLiveInspectionLeaseState).mockResolvedValue(endedLease as any);

        const result = await stopLiveInspection(
            {
                dbClient: {} as any,
                examId: 'exam-123',
                leaseId: 'lease-123',
                viewerUserId: 'viewer-123',
                role: 'instructor',
                activeInstitutionId: 'inst-123',
            },
            { config: enabledConfig, liveKit: mockLiveKit },
        );

        expect(result.state).toBe('ENDED');
        expect(repository.compareAndSetLiveInspectionLeaseState).toHaveBeenCalledTimes(2);
    });

    it('handles concurrency race where another caller terminalizes during cleanup', async () => {
        const requestedLease = { ...mockLease, state: 'REQUESTED', version: 1 };
        const stoppingLease = { ...requestedLease, state: 'STOPPING', version: 2 };
        const endedLease = { ...stoppingLease, state: 'ENDED', version: 3, end_reason: 'VIEWER_STOPPED' };

        vi.mocked(repository.getLiveInspectionLeaseForViewer)
            .mockResolvedValueOnce(requestedLease as any)
            .mockResolvedValueOnce(endedLease as any); // re-read returns ended

        vi.mocked(repository.compareAndSetLiveInspectionLeaseState).mockResolvedValue(stoppingLease as any);
        vi.mocked(stateService.terminalizeLiveInspectionLeaseState).mockResolvedValue(undefined); // another caller terminalized first

        const result = await stopLiveInspection(
            {
                dbClient: {} as any,
                examId: 'exam-123',
                leaseId: 'lease-123',
                viewerUserId: 'viewer-123',
                role: 'instructor',
                activeInstitutionId: 'inst-123',
            },
            { config: enabledConfig, liveKit: mockLiveKit },
        );

        expect(result.state).toBe('ENDED');
        expect(stateService.terminalizeLiveInspectionLeaseState).toHaveBeenCalled();
        expect(LiveKitService.logLiveInspectionLifecycleEvent).not.toHaveBeenCalled(); // We lost the race to terminalize, so we don't log
    });

    it('throws 409 if convergence retries are exhausted due to continuous conflicts', async () => {
        const leaseState = { ...mockLease, state: 'REQUESTED', version: 1 };

        vi.mocked(repository.getLiveInspectionLeaseForViewer).mockResolvedValue(leaseState as any);
        vi.mocked(repository.compareAndSetLiveInspectionLeaseState).mockResolvedValue(undefined); // always conflict

        await expect(
            stopLiveInspection(
                {
                    dbClient: {} as any,
                    examId: 'exam-123',
                    leaseId: 'lease-123',
                    viewerUserId: 'viewer-123',
                    role: 'instructor',
                    activeInstitutionId: 'inst-123',
                },
                { config: enabledConfig, liveKit: mockLiveKit },
            )
        ).rejects.toThrow(new HTTPException(409, { message: 'Live inspection lease state transition conflict.' }));
    });
});
