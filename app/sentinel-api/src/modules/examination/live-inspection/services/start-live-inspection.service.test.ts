import { describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { startLiveInspection } from './start-live-inspection.service';
import type { LiveKitConfig } from '../../../infrastructure/livekit/livekit.config';

const disabledConfig: LiveKitConfig = {
    enabled: false,
    allowedInstitutionIds: [],
    liveKitUrl: null,
    apiKey: null,
    apiSecret: null,
    requestTimeoutMs: 20_000,
    viewerJoinTimeoutMs: 15_000,
    maxInspectionDurationSeconds: 300,
    tokenTtlSeconds: 60,
    roomEmptyTimeoutSeconds: 30,
    roomDepartureTimeoutSeconds: 10,
    globalActiveInspectionLimit: 20,
    institutionActiveInspectionLimit: 10,
};

describe('startLiveInspection', () => {
    it('fails closed before authorization, database acquisition, or provider calls when disabled', async () => {
        const liveKit = {
            createInspectionRoom: vi.fn(),
        };

        await expect(
            startLiveInspection(
                {
                    dbClient: {} as any,
                    examId: '11111111-1111-4111-8111-111111111111',
                    attemptId: '22222222-2222-4222-8222-222222222222',
                    viewerUserId: '33333333-3333-4333-8333-333333333333',
                    role: 'instructor',
                    activeInstitutionId: '44444444-4444-4444-8444-444444444444',
                    activePermissionKeys: ['examinations:monitor_live_video'],
                },
                { config: disabledConfig, liveKit: liveKit as any },
            ),
        ).rejects.toBeInstanceOf(HTTPException);
        expect(liveKit.createInspectionRoom).not.toHaveBeenCalled();
    });
});
