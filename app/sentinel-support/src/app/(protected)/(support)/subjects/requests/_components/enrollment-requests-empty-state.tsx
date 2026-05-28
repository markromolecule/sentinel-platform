'use client';

import { EmptyState } from '@sentinel/ui';

/**
 * EnrollmentRequestsEmptyState is rendered when there are no enrollment requests.
 */
export function EnrollmentRequestsEmptyState() {
    return (
        <EmptyState
            icon="📝"
            title="No enrollment requests yet"
            description="Instructor enrollment requests will appear here once subjects are submitted for review."
        />
    );
}
