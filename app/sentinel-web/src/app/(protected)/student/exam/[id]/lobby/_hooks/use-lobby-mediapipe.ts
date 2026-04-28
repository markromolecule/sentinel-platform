import { useMemo } from 'react';
import { isMediaPipeRuntimeEnabled } from '@sentinel/shared';
import {
    resolveStudentExamMediaPipeSandbox,
    resolveStoredStudentExamMediaPipeActivation,
    type StudentExamMediaPipeSandboxLike,
} from '../../_lib/student-exam-flow';
import type { ExamConfig } from '@sentinel/shared/types';

export type UseLobbyMediaPipeArgs = {
    examId: string;
    configuration: ExamConfig;
    mediaPipeSandbox: StudentExamMediaPipeSandboxLike;
    currentTime: number;
};

export function useLobbyMediaPipe({
    examId,
    configuration,
    mediaPipeSandbox,
    currentTime,
}: UseLobbyMediaPipeArgs) {
    const effectiveMediaPipeSandbox = useMemo(
        () => resolveStudentExamMediaPipeSandbox({ configuration, mediaPipeSandbox }),
        [configuration, mediaPipeSandbox],
    );

    const requiresAttemptMediaPipeActivation = useMemo(
        () =>
            isMediaPipeRuntimeEnabled({
                sandbox: effectiveMediaPipeSandbox,
                configuration,
                stage: 'attempt',
                runtimeAccessAllowed: true,
            }),
        [configuration, effectiveMediaPipeSandbox],
    );

    const mediaPipeActivation = useMemo(
        () =>
            resolveStoredStudentExamMediaPipeActivation({
                examId,
                required: requiresAttemptMediaPipeActivation,
                nowMs: currentTime,
            }),
        [currentTime, examId, requiresAttemptMediaPipeActivation],
    );

    const mediaPipeLobbyMessage = useMemo(() => {
        if (mediaPipeActivation.status === 'missing') {
            return 'Return to checkup first so MediaPipe can finish activation before the attempt starts.';
        }
        if (mediaPipeActivation.status === 'stale') {
            return 'Your MediaPipe checkup activation expired. Run the checkup again before entering the attempt.';
        }
        return null;
    }, [mediaPipeActivation.status]);

    return {
        mediaPipeActivation,
        mediaPipeLobbyMessage,
    };
}
