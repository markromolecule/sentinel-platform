'use client';

import type { StudentSession } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';

function getLifecycleBadgeClassName(student: StudentSession) {
    switch (student.lifecycleState) {
        case 'LOCKED':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'CLOSED':
            return 'border-red-200 bg-red-50 text-red-700';
        case 'SUPERSEDED':
            return 'border-slate-200 bg-slate-100 text-slate-700';
        case 'SUBMITTED':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'IN_PROGRESS':
        default:
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
}

/**
 * Renders compact lifecycle and score-state cues for one monitored attempt in sentinel-core.
 */
export function AttemptLifecycleBadge({ student }: { student: StudentSession }) {
    return (
        <>
            <Badge variant="outline" className={getLifecycleBadgeClassName(student)}>
                {student.lifecycleState?.replaceAll('_', ' ') ?? 'IN PROGRESS'}
            </Badge>
            {student.scoreState ? (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                    {student.scoreState.replaceAll('_', ' ')}
                </Badge>
            ) : null}
        </>
    );
}
