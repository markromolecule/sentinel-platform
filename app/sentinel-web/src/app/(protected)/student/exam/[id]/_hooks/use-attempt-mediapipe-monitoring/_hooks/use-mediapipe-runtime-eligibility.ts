'use client';

import { useMemo } from 'react';
import { isMediaPipeRuntimeEnabled } from '@sentinel/shared';
import type { ExamConfig, ExamRuntimeAccess } from '@sentinel/shared/types';
import { resolveStoredStudentExamMediaPipeActivation } from '../../../_lib/student-exam-flow';
import type { ResolvedMediaPipeSandbox } from '../_types';

export type UseMediapipeRuntimeEligibilityArgs = {
    examId: string;
    examSessionId?: string;
    studentId?: string;
    configuration?: ExamConfig;
    activeSandbox: ResolvedMediaPipeSandbox | undefined;
    runtimeAccess?: ExamRuntimeAccess | null;
};

export type MediapipeRuntimeEligibility = {
    /** True when all preconditions (session, student, camera, runtime access, sandbox) are met. */
    baseRuntimeEnabled: boolean;
    /** Stored activation state from the checkup flow. */
    activationState: ReturnType<typeof resolveStoredStudentExamMediaPipeActivation>;
    /** Final gate: `baseRuntimeEnabled` AND `activationState.isValid`. */
    isEnabled: boolean;
};

/**
 * Derives the three-layer eligibility check that gates whether MediaPipe
 * monitoring should run:
 *
 * 1. `baseRuntimeEnabled` — runtime access, sandbox, camera requirement all satisfied.
 * 2. `activationState`    — checkup activation is present and not stale.
 * 3. `isEnabled`          — both of the above are true.
 */
export function useMediapipeRuntimeEligibility({
    examId,
    examSessionId,
    studentId,
    configuration,
    activeSandbox,
    runtimeAccess,
}: UseMediapipeRuntimeEligibilityArgs): MediapipeRuntimeEligibility {
    const runtimeAccessAllowed = Boolean(
        runtimeAccess?.canStart || runtimeAccess?.canResume || runtimeAccess?.hasActiveAttempt,
    );

    const baseRuntimeEnabled = Boolean(
        examSessionId &&
        studentId &&
        configuration?.cameraRequired &&
        isMediaPipeRuntimeEnabled({
            sandbox: activeSandbox,
            configuration,
            stage: 'attempt',
            runtimeAccessAllowed,
        }),
    );

    const activationState = useMemo(
        () =>
            resolveStoredStudentExamMediaPipeActivation({
                examId,
                required: baseRuntimeEnabled,
            }),
        [baseRuntimeEnabled, examId],
    );

    const isEnabled = baseRuntimeEnabled && activationState.isValid;

    return { baseRuntimeEnabled, activationState, isEnabled };
}
