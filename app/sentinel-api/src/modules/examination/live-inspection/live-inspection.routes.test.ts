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
import { startLiveInspectionSchema } from './live-inspection.dto';

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

    it('defaults restart to false in startLiveInspectionSchema body', () => {
        const parsed = startLiveInspectionSchema.body.parse({
            attemptId: '11111111-1111-4111-8111-111111111111',
        });
        expect(parsed.restart).toBe(false);

        const parsedTrue = startLiveInspectionSchema.body.parse({
            attemptId: '11111111-1111-4111-8111-111111111111',
            restart: true,
        });
        expect(parsedTrue.restart).toBe(true);
    });

    it('confirms startLiveInspectionSchema response is token-free', () => {
        const schemaKeys = Object.keys(startLiveInspectionSchema.response.shape.data.shape);
        expect(schemaKeys).not.toContain('token');
        expect(schemaKeys).not.toContain('secret');
        expect(schemaKeys).not.toContain('credentials');
    });
});
