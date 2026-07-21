'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { Camera, Mic, ScanFace } from 'lucide-react';
import { useStudentExamStageGuard } from '../../_hooks/use-student-exam-stage-guard';
import { useCheckupMediaPipe } from '../../_hooks/use-checkup-mediapipe';
import { useStudentCheckupManager } from '../../_hooks/use-student-checkup-manager';
import {
    patchStoredStudentExamFlow,
    resolveStudentExamMediaPipeSandbox,
} from '../../_lib/student-exam-flow';

function formatCalibrationHoldDuration(seconds: number) {
    if (seconds <= 0) {
        return '0 seconds';
    }

    const rounded = Number.isInteger(seconds) ? seconds.toFixed(0) : seconds.toFixed(1);
    return `${rounded} second${seconds === 1 ? '' : 's'}`;
}

/**
 * Custom hook encapsulating data fetching, device verification, MediaPipe calibration,
 * derived status messages, and state persistence for the Student Exam Checkup page.
 */
export function useCheckupPage() {
    const stageGuard = useStudentExamStageGuard('checkup');
    const {
        examId,
        blockedState,
        configuration,
        mediaPipeSandbox,
        isResolving,
    } = stageGuard;

    const effectiveMediaPipeSandbox = useMemo(
        () =>
            resolveStudentExamMediaPipeSandbox({
                configuration,
                mediaPipeSandbox,
            }),
        [configuration, mediaPipeSandbox],
    );

    const {
        videoRef,
        cameraState,
        micState,
        isRequesting,
        isStreamActive,
        errorMessage,
        isCheckupReady: isDeviceCheckupReady,
        requestDeviceAccess,
    } = useStudentCheckupManager({ configuration });

    const {
        overlayCanvasRef,
        analysis: mediaPipeAnalysis,
        calibrationProgress,
        calibrationHoldSecondsRemaining,
        calibrationProfile,
        isCalibrated,
    } = useCheckupMediaPipe({
        videoRef,
        streamActive: isStreamActive,
        configuration,
        mediaPipeSandbox: effectiveMediaPipeSandbox,
    });

    const isMediaPipeConfigured = Boolean(
        effectiveMediaPipeSandbox.enabled && effectiveMediaPipeSandbox.captureDuringCheckup,
    );
    const isCalibrationPending = isMediaPipeConfigured && !isCalibrated;
    const isMediaPipeReady = !isMediaPipeConfigured || (isCalibrated && !isCalibrationPending);
    const isCheckupReady = isDeviceCheckupReady && isMediaPipeReady;
    const effectiveCameraState = cameraState;
    const effectiveMicState = micState;
    const effectiveIdentityState = isCalibrated ? ('granted' as const) : ('idle' as const);
    const isCheckupFlowReady = isCheckupReady;

    const handleRequestDeviceAccess = useCallback(() => {
        patchStoredStudentExamFlow(examId, {
            checkupCompleted: false,
            mediaPipeActivatedAt: null,
            mediaPipeCalibrationCompletedAt: null,
            mediaPipeActivationSource: null,
            mediaPipeCalibrationProfile: null,
        });
        requestDeviceAccess();
    }, [examId, requestDeviceAccess]);

    const checks = [
        {
            label: 'Camera',
            description: configuration.cameraRequired
                ? 'Required for face visibility during the exam.'
                : 'Not required for this exam.',
            state: configuration.cameraRequired ? effectiveCameraState : 'granted',
            icon: Camera,
        },
        {
            label: 'Microphone',
            description: configuration.micRequired
                ? 'Required for room audio monitoring.'
                : 'Not required for this exam.',
            state: configuration.micRequired ? effectiveMicState : 'granted',
            icon: Mic,
        },
        ...(isMediaPipeConfigured
            ? [
                  {
                      label: 'Identity Scan',
                      description: 'A stable face scan ensures secure session ownership.',
                      state: effectiveIdentityState,
                      icon: ScanFace,
                  },
              ]
            : []),
    ] as const;

    const calibrationHoldDurationLabel = formatCalibrationHoldDuration(
        calibrationHoldSecondsRemaining,
    );

    const currentStatusLabel = isCheckupFlowReady
        ? 'Ready for lobby'
        : isCalibrationPending
          ? 'Calibrating identity'
          : isDeviceCheckupReady
            ? 'Waiting for final checks'
            : 'Device access required';

    const currentStatusDescription = isCheckupFlowReady
        ? 'Your device and monitoring setup are ready. You can continue to the lobby.'
        : isCalibrationPending
          ? mediaPipeAnalysis?.status === 'ready'
              ? `Hold steady for ${calibrationHoldDurationLabel} to complete the scan.`
              : 'Center your face in the camera guide so the identity scan can begin.'
          : isDeviceCheckupReady
            ? 'Finish the remaining setup steps before continuing.'
            : 'Grant the required device permissions before the exam can proceed.';

    useEffect(() => {
        if (!isCheckupReady) {
            patchStoredStudentExamFlow(examId, {
                checkupCompleted: false,
            });
            return;
        }

        const hasCompletedMediaPipeActivation = isMediaPipeConfigured;

        patchStoredStudentExamFlow(examId, {
            checkupCompleted: true,
            mediaPipeActivatedAt: hasCompletedMediaPipeActivation
                ? new Date().toISOString()
                : null,
            mediaPipeCalibrationCompletedAt: hasCompletedMediaPipeActivation
                ? new Date().toISOString()
                : null,
            mediaPipeActivationSource: hasCompletedMediaPipeActivation ? 'checkup' : null,
            mediaPipeCalibrationProfile: hasCompletedMediaPipeActivation
                ? calibrationProfile
                : null,
        });
    }, [calibrationProfile, examId, isCheckupReady, isMediaPipeConfigured]);

    return {
        examId,
        blockedState,
        configuration,
        isLoading: isResolving,
        isRedirectingToHistory: false,
        videoRef,
        overlayCanvasRef,
        isRequesting,
        isStreamActive,
        errorMessage,
        mediaPipeAnalysis,
        calibrationProgress,
        calibrationHoldDurationLabel,
        isCalibrated,
        isMediaPipeConfigured,
        isCalibrationPending,
        isCheckupFlowReady,
        handleRequestDeviceAccess,
        checks,
        currentStatusLabel,
        currentStatusDescription,
    };
}
