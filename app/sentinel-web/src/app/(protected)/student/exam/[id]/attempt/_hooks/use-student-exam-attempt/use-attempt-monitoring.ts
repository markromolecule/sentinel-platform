import type {
    ExamConfig,
    ExamRuntimeAccess,
    TelemetryMediaPipeSandboxSettings,
} from '@sentinel/shared/types';
import { useAttemptMediaPipeMonitoring } from '@/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring';
import { useExamMonitoring } from '@/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring';

export type UseAttemptMonitoringArgs = {
    examId: string;
    configuration?: ExamConfig;
    examSessionId?: string;
    isRedirectingToTurnIn: boolean;
    mediaPipeSandbox?: TelemetryMediaPipeSandboxSettings;
    runtimeAccess?: ExamRuntimeAccess | null;
};

export function useAttemptMonitoring({
    examId,
    configuration,
    examSessionId,
    isRedirectingToTurnIn,
    mediaPipeSandbox,
    runtimeAccess,
}: UseAttemptMonitoringArgs) {
    const {
        securityLockReason,
        isResumingExam,
        resumeSecuredExam,
        fullScreenContainerRef,
        suspendSecurityMonitoring,
    } = useExamMonitoring({
        examId,
        configuration,
        examSessionId,
        isMonitoringSuspended: isRedirectingToTurnIn,
    });

    const {
        videoRef: mediaPipeVideoRef,
        analysis: mediaPipeAnalysis,
        phase: mediaPipePhase,
        errorMessage: mediaPipeErrorMessage,
        activeIncident: mediaPipeIncident,
        dismissIncident: dismissMediaPipeIncident,
        isEnabled: isMediaPipeEnabled,
    } = useAttemptMediaPipeMonitoring({
        examId,
        configuration,
        mediaPipeSandbox,
        examSessionId,
        runtimeAccess,
    });

    return {
        securityLockReason,
        isResumingExam,
        resumeSecuredExam,
        fullScreenContainerRef,
        suspendSecurityMonitoring,
        mediaPipeVideoRef,
        mediaPipeAnalysis,
        mediaPipePhase,
        mediaPipeErrorMessage,
        mediaPipeIncident,
        dismissMediaPipeIncident,
        isMediaPipeEnabled,
    };
}
