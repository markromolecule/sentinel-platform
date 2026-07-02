import { describe, expect, it } from 'vitest';
import { RESTFUL_ROUTE_AUDIT } from './route-audit';

describe('RESTFUL_ROUTE_AUDIT', () => {
    it('marks student history attempt and exam detail routes for conversion', () => {
        expect(
            RESTFUL_ROUTE_AUDIT.find(
                (item) => item.currentPath === '/student/history/details?attemptId=[attemptId]',
            ),
        ).toMatchObject({
            canonicalPath: '/student/history/attempts/[attemptId]',
            decision: 'convert',
        });

        expect(
            RESTFUL_ROUTE_AUDIT.find(
                (item) => item.currentPath === '/student/history/details?examId=[examId]',
            ),
        ).toMatchObject({
            canonicalPath: '/student/history/exams/[examId]',
            decision: 'convert',
        });
    });

    it('marks query-based UI state routes for defer', () => {
        expect(
            RESTFUL_ROUTE_AUDIT.find((item) => item.currentPath === '/exams?view=[view]'),
        ).toMatchObject({
            canonicalPath: null,
            decision: 'defer',
        });

        expect(
            RESTFUL_ROUTE_AUDIT.find((item) => item.currentPath === '/messages?search=[query]'),
        ).toMatchObject({
            canonicalPath: null,
            decision: 'defer',
        });
    });
});
