'use client';

import { StudentFlowShell } from '../../_components/student-flow-shell';
import { StudentFlowPageHeader } from '../../../_components/student-flow-primitives';

export type CheckupBlockedStateProps = {
    title?: string | null;
    message?: string | null;
};

/**
 * Sub-component displaying the blocked exam state during checkup.
 */
export function CheckupBlockedState({ title, message }: CheckupBlockedStateProps) {
    return (
        <StudentFlowShell
            maxWidthClassName="max-w-5xl"
            mainClassName="py-5 sm:py-6"
            contentClassName="my-auto"
        >
            <div className="flex min-h-full flex-col justify-center gap-5">
                <StudentFlowPageHeader
                    title={title ?? 'Exam Unavailable'}
                    description={message ?? 'This exam cannot be entered right now.'}
                />
            </div>
        </StudentFlowShell>
    );
}
