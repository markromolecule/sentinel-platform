'use client';

import { useEffect, useRef, useState } from 'react';
import { useApi, useAuth } from '@sentinel/hooks';
import { toast } from 'sonner';
import { AudioAnomalyController } from './audio-anomaly-controller';
import { useAnomalyTelemetry } from './use-anomaly-telemetry';
import type {
    AudioWorkerPhase,
    AudioWorkerResult,
    UseAudioAnomalyWorkerArgs,
} from './_types';

/**
 * Manages the browser audio-anomaly worker lifecycle for a student exam attempt.
 * Delegates low-level Audio Graph and Web Worker management to AudioAnomalyController.
 *
 * @param args Configuration options, exam/student IDs, and optional external worker/stream
 */
export function useAudioAnomalyWorker({
    configuration,
    examSessionId,
    isSuspended = false,
    runtimeConfig,
    audioStream,
    worker: providedWorker,
}: UseAudioAnomalyWorkerArgs): AudioWorkerResult {
    const apiClient = useApi();
    const { user } = useAuth();
    const studentId = user?.id;

    const [phase, setPhase] = useState<AudioWorkerPhase>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const controllerRef = useRef<AudioAnomalyController | null>(null);
    const isSuspendedRef = useRef(isSuspended);

    // Sync isSuspended to a ref to prevent re-triggering the main setup effect
    useEffect(() => {
        isSuspendedRef.current = isSuspended;
    }, [isSuspended]);

    const isEnabled = Boolean(
        configuration?.micRequired &&
        configuration?.aiRules?.audio_anomaly_detection &&
        examSessionId &&
        studentId &&
        !isSuspended,
    );

    const emitAudioTelemetry = useAnomalyTelemetry(
        apiClient,
        examSessionId,
        studentId,
        isSuspendedRef,
    );

    // Lifecycle effect: Start and teardown the controller when active
    useEffect(() => {
        if (!isEnabled) {
            setPhase('idle');
            setErrorMessage(null);
            return;
        }

        const controller = new AudioAnomalyController({
            audioStream,
            providedWorker,
            runtimeConfig,
            onPhaseChange: setPhase,
            onErrorMessage: setErrorMessage,
            onAnomaly: (anomalyType, confidenceScore) => {
                if (isSuspendedRef.current) {
                    return;
                }

                const anomalyLabel = anomalyType.replace(/_/g, ' ').toLowerCase();
                const description =
                    anomalyType === 'SILENCE_DETECTED'
                        ? 'Extended silence was detected and logged for review.'
                        : `A potential security incident (${anomalyLabel}) was detected and logged.`;

                toast.warning('Audio Anomaly Detected', {
                    description,
                });

                void emitAudioTelemetry(anomalyType, confidenceScore).catch(
                    (error: unknown) => {
                        console.error('Failed to emit audio anomaly telemetry.', {
                            anomalyType,
                            confidenceScore,
                            error,
                        });
                    },
                );
            },
        });

        void controller.start();
        controllerRef.current = controller;

        return () => {
            controller.dispose();
            controllerRef.current = null;
        };
    }, [isEnabled, audioStream, providedWorker, emitAudioTelemetry]);

    // Config Sync Effect: Cheaply sync config changes without restarting the graph
    useEffect(() => {
        if (controllerRef.current && phase === 'running') {
            controllerRef.current.updateConfig(runtimeConfig);
        }
    }, [runtimeConfig, phase]);

    return {
        errorMessage: isEnabled ? errorMessage : null,
        isEnabled,
        phase: isEnabled ? phase : 'idle',
    };
}
