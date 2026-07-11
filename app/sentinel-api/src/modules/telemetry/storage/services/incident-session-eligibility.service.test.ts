import { describe, expect, it, vi } from 'vitest';
import { checkTelemetrySessionEligibility } from './incident-session-eligibility.service';

describe('checkTelemetrySessionEligibility', () => {
    const baseSession = {
        attempt_id: 'attempt-1',
        user_id: 'student-user-1',
        institution_id: 'institution-1',
        completed_at: null,
        status: 'IN_PROGRESS',
    } as const;

    it('accepts fullscreen exit events while the attempt is still active', () => {
        expect(
            checkTelemetrySessionEligibility(baseSession, {
                studentId: 'student-user-1',
                eventType: 'FULL_SCREEN_EXIT',
            }),
        ).toEqual({
            ok: true,
            session: baseSession,
        });
    });

    it('silently ignores fullscreen exit events after completion', () => {
        vi.setSystemTime(new Date('2026-07-11T03:00:00.000Z'));

        expect(
            checkTelemetrySessionEligibility(
                {
                    ...baseSession,
                    completed_at: new Date('2026-07-11T02:59:00.000Z'),
                    status: 'COMPLETED',
                },
                {
                    studentId: 'student-user-1',
                    eventType: 'FULL_SCREEN_EXIT',
                },
            ),
        ).toEqual({
            ok: false,
            errorType: 'IGNORE_SILENTLY',
            message: 'Ignoring post-completion fullscreen telemetry',
        });
    });
});
