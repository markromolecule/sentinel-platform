import { useEffect } from 'react';
import type {
    AudioAnomalySettings,
    ExamConfig,
    ExamRuntimeAccess,
    TelemetryMediaPipeSandboxSettings,
} from '@sentinel/shared/types';
import { useAttemptMediaPipeMonitoring } from '@/app/(protected)/student/exam/[id]/_hooks/use-attempt-mediapipe-monitoring';
import { useExamMonitoring, type AttemptMonitoringPhase } from '@/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring';
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
    monitoringPhase?: AttemptMonitoringPhase;
};

/**
 * Hook to orchestrate student attempt security monitoring.
 * Coordinates browser interaction security, MediaPipe camera proctoring, and audio anomaly detection.
 * 
 * @param args - Configuration settings and state for security, media, and audio monitoring.
 * @returns Combined status states, references, and error messages for attempt proctoring.
 */
export function useAttemptMonitoring({
    examId,
    audioSettings,
    configuration,
    examSessionId,
    isRedirectingToTurnIn,
    mediaPipeSandbox,
    runtimeAccess,
    monitoringPhase,
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
        monitoringPhase: monitoringPhase ?? (isRedirectingToTurnIn ? 'navigating-to-turn-in' : 'active'),
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

    const { audioStream, worker: audioWorker, ensureAudioAccess } = useCheckupAudio();

    useEffect(() => {
        const isMicRequired = configuration?.micRequired ?? false;
        const isAudioAnomalyEnabled = configuration?.aiRules?.audio_anomaly_detection ?? false;
        if ((isMicRequired || isAudioAnomalyEnabled) && configuration && !isRedirectingToTurnIn) {
            ensureAudioAccess(configuration).catch((err) => {
                console.error('Failed to ensure audio access in attempt:', err);
            });
        }
    }, [configuration, ensureAudioAccess, isRedirectingToTurnIn]);

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

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[Audio Diagnostics]', {
                hasStream: Boolean(audioStream),
                isStreamLive: audioStream ? audioStream.getTracks().some((t) => t.kind === 'audio' && t.readyState === 'live') : false,
                hasWorker: Boolean(audioWorker),
                examSessionId,
                audioMonitoringPhase,
            });
        }
    }, [audioStream, audioWorker, examSessionId, audioMonitoringPhase]);

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
