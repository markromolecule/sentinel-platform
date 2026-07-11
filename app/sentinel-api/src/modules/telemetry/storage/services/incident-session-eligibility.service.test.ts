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

    it('keeps rejecting fullscreen teardown retries even inside the recent-completion grace period', () => {
        vi.setSystemTime(new Date('2026-07-11T03:00:00.000Z'));

        const session = {
            ...baseSession,
            completed_at: new Date('2026-07-11T02:58:30.000Z'),
            status: 'COMPLETED',
        } as const;

        expect(
            checkTelemetrySessionEligibility(session, {
                studentId: 'student-user-1',
                eventType: 'FULL_SCREEN_EXIT',
            }),
        ).toEqual({
            ok: false,
            errorType: 'IGNORE_SILENTLY',
            message: 'Ignoring post-completion fullscreen telemetry',
        });
        expect(
            checkTelemetrySessionEligibility(session, {
                studentId: 'student-user-1',
                eventType: 'FULL_SCREEN_EXIT',
            }),
        ).toEqual({
            ok: false,
            errorType: 'IGNORE_SILENTLY',
            message: 'Ignoring post-completion fullscreen telemetry',
        });
    });
});
