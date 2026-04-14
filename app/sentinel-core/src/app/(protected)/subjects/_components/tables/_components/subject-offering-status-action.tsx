'use client';

import { type ReactNode } from 'react';
import { Ban, RotateCcw } from 'lucide-react';
import { type SubjectOffering } from '@sentinel/shared/types';

export type SubjectOfferingStatusActionConfig = {
    nextStatus: 'OPEN' | 'CLOSED';
    actionLabel: string;
    dialogTitle: string;
    dialogDescription: string;
    pendingLabel: string;
    menuClassName: string;
    confirmVariant: 'default' | 'destructive';
    confirmClassName: string;
    icon: ReactNode;
};

export function buildSubjectOfferingTermLabel(offering: SubjectOffering) {
    return `${offering.termAcademicYear} • ${offering.termSemester}`;
}

export function getSubjectOfferingStatusAction(
    offering: SubjectOffering,
): SubjectOfferingStatusActionConfig {
    const termLabel = buildSubjectOfferingTermLabel(offering);
    const subjectLabel = `"${offering.subjectCode} - ${offering.subjectTitle}"`;

    if (offering.status === 'CLOSED') {
        return {
            nextStatus: 'OPEN',
            actionLabel: 'Reopen Subject',
            dialogTitle: 'Reopen Offered Subject?',
            dialogDescription: `This will reopen ${subjectLabel} for ${termLabel} when the term is still active.`,
            pendingLabel: 'Reopening...',
            menuClassName: 'text-emerald-600 focus:text-emerald-600',
            confirmVariant: 'default',
            confirmClassName: 'bg-emerald-600 text-white hover:bg-emerald-700',
            icon: <RotateCcw className="mr-2 h-4 w-4" />,
        };
    }

    return {
        nextStatus: 'CLOSED',
        actionLabel: 'Close Subject',
        dialogTitle: 'Close Offered Subject?',
        dialogDescription: `This will close ${subjectLabel} for ${termLabel}. Instructors will no longer be able to fetch it.`,
        pendingLabel: 'Closing...',
        menuClassName: 'text-amber-600 focus:text-amber-600',
        confirmVariant: 'destructive',
        confirmClassName: 'bg-amber-600 text-white hover:bg-amber-700',
        icon: <Ban className="mr-2 h-4 w-4" />,
    };
}
