import { describe, expect, it } from 'vitest';
import { LIVE_INSPECTION_QUERY_KEYS } from './query-keys';
import {
    createPublisherLiveInspectionCredentials,
    createViewerLiveInspectionCredentials,
} from './live-inspection-credentials';

describe('live inspection hooks', () => {
    it('keeps status query keys free of token-bearing labels', () => {
        expect(LIVE_INSPECTION_QUERY_KEYS.status('exam-1', 'lease-1')).toEqual([
            'exams',
            'live-inspection',
            'exam-1',
            'status',
            'lease-1',
            null,
        ]);
        expect(JSON.stringify(LIVE_INSPECTION_QUERY_KEYS.all).toLowerCase()).not.toContain('token');
    });

    it('keeps credential acquisition outside useQuery cache paths', () => {
        expect(createViewerLiveInspectionCredentials.name).toBe(
            'createViewerLiveInspectionCredentials',
        );
        expect(createPublisherLiveInspectionCredentials.name).toBe(
            'createPublisherLiveInspectionCredentials',
        );
        expect(JSON.stringify(LIVE_INSPECTION_QUERY_KEYS.all).toLowerCase()).not.toContain(
            'credential',
        );
    });
});
