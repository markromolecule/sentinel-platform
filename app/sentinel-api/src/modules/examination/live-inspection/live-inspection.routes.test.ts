import { describe, expect, it } from 'vitest';
import {
    acknowledgePublisherFailureRoute,
    acknowledgePublisherReadyRoute,
    createPublisherConnectionRoute,
    createViewerConnectionRoute,
    getLiveInspectionStatusRoute,
    getStudentLiveInspectionDirectiveRoute,
    startLiveInspectionRoute,
    stopLiveInspectionRoute,
} from './live-inspection.routes';

describe('live inspection routes', () => {
    it('registers staff endpoints under exam monitoring paths', () => {
        expect(startLiveInspectionRoute.method).toBe('post');
        expect(startLiveInspectionRoute.path).toBe('/:examId/monitoring/live-inspections');
        expect(getLiveInspectionStatusRoute.path).toBe(
            '/:examId/monitoring/live-inspections/status',
        );
        expect(createViewerConnectionRoute.path).toBe(
            '/:examId/monitoring/live-inspections/:leaseId/viewer-connection',
        );
        expect(stopLiveInspectionRoute.path).toBe(
            '/:examId/monitoring/live-inspections/:leaseId/stop',
        );
    });

    it('registers student endpoints under examination flow paths', () => {
        expect(getStudentLiveInspectionDirectiveRoute.path).toBe('/live-inspections/directive');
        expect(createPublisherConnectionRoute.path).toBe('/live-inspections/publisher-connection');
        expect(acknowledgePublisherReadyRoute.path).toBe('/live-inspections/publisher-ready');
        expect(acknowledgePublisherFailureRoute.path).toBe('/live-inspections/publisher-failure');
    });
});
