import type {
    AudioAnomalySettings,
    ExamConfig,
    ExamRuntimeAccess,
    TelemetryMediaPipeSandboxSettings,
} from '@sentinel/shared/types';
import { useAttemptMediaPipeMonitoring } from '@/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring';
import { useExamMonitoring } from '@/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring';
import { useAudioAnomalyWorker } from '@/hooks/use-audio-anomaly-worker';
import { useCheckupAudio } from '@/app/(protected)/student/exam/[id]/_components/student-exam-audio-provider';

export type UseAttemptMonitoringArgs = {
    examId: string;
    audioSettings?: AudioAnomalySettings | null;
    configuration?: ExamConfig;
    examSessionId?: string;
    isRedirectingToTurnIn: boolean;
    mediaPipeSandbox?: TelemetryMediaPipeSandboxSettings;
    runtimeAccess?: ExamRuntimeAccess | null;
};

export function useAttemptMonitoring({
    examId,
    audioSettings,
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
        isRedirectingToTurnIn,
        runtimeAccess,
    });

    const { audioStream, worker: audioWorker } = useCheckupAudio();

    const {
        errorMessage: audioErrorMessage,
        isEnabled: isAudioMonitoringEnabled,
        phase: audioMonitoringPhase,
    } = useAudioAnomalyWorker({
        configuration,
        examSessionId,
        isSuspended: isRedirectingToTurnIn,
        runtimeConfig: audioSettings,
        audioStream,
        worker: audioWorker,
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
        audioErrorMessage,
        isAudioMonitoringEnabled,
        audioMonitoringPhase,
    };
}
