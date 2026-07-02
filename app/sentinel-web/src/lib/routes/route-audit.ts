export type RestfulRouteAuditDecision = 'convert' | 'defer';

export type RestfulRouteAuditItem = {
    currentPath: string;
    canonicalPath: string | null;
    decision: RestfulRouteAuditDecision;
    reason: string;
};

/**
 * Captures the current route audit for query-string paths that should become
 * canonical RESTful URLs versus query params that should remain UI state.
 */
export const RESTFUL_ROUTE_AUDIT: RestfulRouteAuditItem[] = [
    {
        currentPath: '/student/history/details?attemptId=[attemptId]',
        canonicalPath: '/student/history/attempts/[attemptId]',
        decision: 'convert',
        reason: 'Attempt id identifies a concrete student history resource.',
    },
    {
        currentPath: '/student/history/details?examId=[examId]',
        canonicalPath: '/student/history/exams/[examId]',
        decision: 'convert',
        reason: 'Exam id identifies the fallback history detail resource when no attempt exists.',
    },
    {
        currentPath: '/exams/logs?examId=[examId]',
        canonicalPath: '/exams/[examId]/logs',
        decision: 'convert',
        reason: 'Exam id identifies a concrete exam-specific incident log resource.',
    },
    {
        currentPath: '/exams/assign?examId=[examId]',
        canonicalPath: '/exams/[examId]/assign',
        decision: 'convert',
        reason: 'Exam id identifies a concrete exam assignment management resource.',
    },
    {
        currentPath: '/exams?view=[view]',
        canonicalPath: null,
        decision: 'defer',
        reason: 'The query value represents UI mode, not a persisted resource identity.',
    },
    {
        currentPath: '/messages?tab=[tab]',
        canonicalPath: null,
        decision: 'defer',
        reason: 'Tab selection is transient page state rather than a canonical entity route.',
    },
    {
        currentPath: '/messages?search=[query]',
        canonicalPath: null,
        decision: 'defer',
        reason: 'Search terms are filter state and should remain query params.',
    },
    {
        currentPath: '/dashboard?selected=[id]',
        canonicalPath: null,
        decision: 'defer',
        reason: 'Selected dashboard state is contextual UI state rather than a route resource.',
    },
];
