import { describe, it, expect } from 'vitest';
import {
    resolveMediaPipeIncident,
    isSameMediaPipeAnalysis,
    calculateIncidentDuration,
    buildMediaPipeTelemetryMetadata,
    evaluateIncidentTrigger,
} from './mobile-mediapipe-incident';

describe('mobile-mediapipe-incident', () => {
    describe('resolveMediaPipeIncident', () => {
        it('maps ready status to null signal and null warning', () => {
            expect(resolveMediaPipeIncident('ready')).toEqual({
                activeSignal: null,
                activeWarning: null,
            });
        });

        it('maps no-face status to NO_FACE_DETECTED and Face not detected', () => {
            expect(resolveMediaPipeIncident('no-face')).toEqual({
                activeSignal: 'NO_FACE_DETECTED',
                activeWarning: 'Face not detected',
            });
        });

        it('maps multiple-faces status to MULTIPLE_FACES and Multiple faces detected', () => {
            expect(resolveMediaPipeIncident('multiple-faces')).toEqual({
                activeSignal: 'MULTIPLE_FACES',
                activeWarning: 'Multiple faces detected',
            });
        });

        it('maps off-screen status to GAZE_OFF_SCREEN and Looking away from screen', () => {
            expect(resolveMediaPipeIncident('off-screen')).toEqual({
                activeSignal: 'GAZE_OFF_SCREEN',
                activeWarning: 'Looking away from screen',
            });
        });

        it('maps unknown/undefined status to null', () => {
            expect(resolveMediaPipeIncident(undefined)).toEqual({
                activeSignal: null,
                activeWarning: null,
            });
            expect(resolveMediaPipeIncident('random-status' as any)).toEqual({
                activeSignal: null,
                activeWarning: null,
            });
        });
    });

    describe('isSameMediaPipeAnalysis', () => {
        const baseAnalysis = {
            status: 'ready' as const,
            signal: 'CALIBRATED' as any,
            faceCount: 1,
            confidenceScore: 0.95,
            gazeDirection: 'center' as any,
            eyeState: 'open' as any,
        };

        it('returns true for identical references or null references', () => {
            expect(isSameMediaPipeAnalysis(null, null)).toBe(true);
            expect(isSameMediaPipeAnalysis(baseAnalysis as any, baseAnalysis as any)).toBe(true);
        });

        it('returns false when one is null and the other is not', () => {
            expect(isSameMediaPipeAnalysis(baseAnalysis as any, null)).toBe(false);
            expect(isSameMediaPipeAnalysis(null, baseAnalysis as any)).toBe(false);
        });

        it('returns true when all monitored properties match', () => {
            const copy = { ...baseAnalysis };
            expect(isSameMediaPipeAnalysis(baseAnalysis as any, copy as any)).toBe(true);
        });

        it('returns false when any key property differs', () => {
            expect(
                isSameMediaPipeAnalysis(baseAnalysis as any, { ...baseAnalysis, status: 'no-face' } as any),
            ).toBe(false);
            expect(
                isSameMediaPipeAnalysis(baseAnalysis as any, { ...baseAnalysis, faceCount: 2 } as any),
            ).toBe(false);
            expect(
                isSameMediaPipeAnalysis(baseAnalysis as any, { ...baseAnalysis, confidenceScore: 0.5 } as any),
            ).toBe(false);
            expect(
                isSameMediaPipeAnalysis(baseAnalysis as any, { ...baseAnalysis, gazeDirection: 'left' } as any),
            ).toBe(false);
        });
    });

    describe('calculateIncidentDuration', () => {
        it('enforces minimum 4000ms duration for small frame counts', () => {
            expect(calculateIncidentDuration(1, 1000)).toBe(4000);
            expect(calculateIncidentDuration(2, 1000)).toBe(4000);
            expect(calculateIncidentDuration(3, 1000)).toBe(4000);
        });

        it('scales duration accurately when frame interval count exceeds minimum', () => {
            expect(calculateIncidentDuration(5, 1000)).toBe(5000);
            expect(calculateIncidentDuration(6, 1500)).toBe(9000);
        });
    });

    describe('buildMediaPipeTelemetryMetadata', () => {
        it('includes durationMs for GAZE_OFF_SCREEN and NO_FACE_DETECTED', () => {
            const gazeMeta = buildMediaPipeTelemetryMetadata({
                signal: 'GAZE_OFF_SCREEN',
                confidenceScore: 0.88,
                durationMs: 5000,
            });
            expect(gazeMeta).toEqual({
                durationMs: 5000,
                confidenceScore: 0.88,
            });

            const noFaceMeta = buildMediaPipeTelemetryMetadata({
                signal: 'NO_FACE_DETECTED',
                confidenceScore: 0.12,
                durationMs: 4500,
            });
            expect(noFaceMeta).toEqual({
                durationMs: 4500,
                confidenceScore: 0.12,
            });
        });

        it('omits durationMs for MULTIPLE_FACES', () => {
            const multiFaceMeta = buildMediaPipeTelemetryMetadata({
                signal: 'MULTIPLE_FACES',
                confidenceScore: 0.99,
                durationMs: 6000,
            });
            expect(multiFaceMeta).toEqual({
                confidenceScore: 0.99,
            });
        });
    });

    describe('evaluateIncidentTrigger', () => {
        it('returns shouldTrigger: true when threshold met and not on cooldown', () => {
            const res = evaluateIncidentTrigger({
                currentConsecutiveFrames: 2,
                consecutiveThreshold: 2,
                lastTriggeredAt: 10000,
                now: 25000,
                cooldownMs: 10000,
            });
            expect(res).toEqual({
                isThresholdMet: true,
                isOnCooldown: false,
                shouldTrigger: true,
            });
        });

        it('returns shouldTrigger: false when threshold is not met', () => {
            const res = evaluateIncidentTrigger({
                currentConsecutiveFrames: 1,
                consecutiveThreshold: 2,
                lastTriggeredAt: 10000,
                now: 25000,
                cooldownMs: 10000,
            });
            expect(res).toEqual({
                isThresholdMet: false,
                isOnCooldown: false,
                shouldTrigger: false,
            });
        });

        it('returns shouldTrigger: false when threshold met but still on cooldown', () => {
            const res = evaluateIncidentTrigger({
                currentConsecutiveFrames: 3,
                consecutiveThreshold: 2,
                lastTriggeredAt: 20000,
                now: 25000,
                cooldownMs: 10000,
            });
            expect(res).toEqual({
                isThresholdMet: true,
                isOnCooldown: true,
                shouldTrigger: false,
            });
        });
    });
});
