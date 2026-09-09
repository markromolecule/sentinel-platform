import { describe, it, expect } from 'vitest';
import {
    isLiveInspectionPublishState,
    isLiveInspectionStopState,
    isLiveInspectionNotFoundError,
} from './mobile-live-inspection';

describe('mobile-live-inspection utilities', () => {
    describe('isLiveInspectionPublishState', () => {
        it('returns true for active publish states', () => {
            expect(isLiveInspectionPublishState('REQUESTED')).toBe(true);
            expect(isLiveInspectionPublishState('PUBLISHER_CONNECTING')).toBe(true);
            expect(isLiveInspectionPublishState('PUBLISHER_READY')).toBe(true);
            expect(isLiveInspectionPublishState('LIVE')).toBe(true);
        });

        it('returns false for terminal or non-publish states', () => {
            expect(isLiveInspectionPublishState('STOPPING')).toBe(false);
            expect(isLiveInspectionPublishState('ENDED')).toBe(false);
            expect(isLiveInspectionPublishState('FAILED')).toBe(false);
            expect(isLiveInspectionPublishState('EXPIRED')).toBe(false);
            expect(isLiveInspectionPublishState('IDLE')).toBe(false);
            expect(isLiveInspectionPublishState(null)).toBe(false);
            expect(isLiveInspectionPublishState(undefined)).toBe(false);
            expect(isLiveInspectionPublishState('')).toBe(false);
        });
    });

    describe('isLiveInspectionStopState', () => {
        it('returns true for stop and terminal states', () => {
            expect(isLiveInspectionStopState('STOPPING')).toBe(true);
            expect(isLiveInspectionStopState('ENDED')).toBe(true);
            expect(isLiveInspectionStopState('FAILED')).toBe(true);
            expect(isLiveInspectionStopState('EXPIRED')).toBe(true);
        });

        it('returns false for active or other states', () => {
            expect(isLiveInspectionStopState('REQUESTED')).toBe(false);
            expect(isLiveInspectionStopState('PUBLISHER_CONNECTING')).toBe(false);
            expect(isLiveInspectionStopState('PUBLISHER_READY')).toBe(false);
            expect(isLiveInspectionStopState('LIVE')).toBe(false);
            expect(isLiveInspectionStopState(null)).toBe(false);
            expect(isLiveInspectionStopState(undefined)).toBe(false);
        });
    });

    describe('isLiveInspectionNotFoundError', () => {
        it('identifies 404 by status or statusCode', () => {
            expect(isLiveInspectionNotFoundError({ status: 404 })).toBe(true);
            expect(isLiveInspectionNotFoundError({ statusCode: 404 })).toBe(true);
        });

        it('identifies 404 by message keywords', () => {
            expect(
                isLiveInspectionNotFoundError({
                    message: 'Live inspection is not available for this session',
                }),
            ).toBe(true);
            expect(
                isLiveInspectionNotFoundError({
                    message: 'Resource not found',
                }),
            ).toBe(true);
        });

        it('returns false for non-404 or other errors', () => {
            expect(isLiveInspectionNotFoundError({ status: 500, message: 'Server error' })).toBe(
                false,
            );
            expect(isLiveInspectionNotFoundError({ statusCode: 403, message: 'Forbidden' })).toBe(
                false,
            );
            expect(isLiveInspectionNotFoundError(null)).toBe(false);
            expect(isLiveInspectionNotFoundError(undefined)).toBe(false);
            expect(isLiveInspectionNotFoundError('error string')).toBe(false);
        });
    });
});
