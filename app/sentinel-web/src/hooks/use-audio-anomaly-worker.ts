'use client';

import { useEffect, useRef, useState } from 'react';
import { useApi, useAuth } from '@sentinel/hooks';
import {
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    TELEMETRY_EVENT_DEFINITIONS,
    type AudioAnomalySettings,
    type AudioAnomalyTypeValue,
    type ExamConfig,
} from '@sentinel/shared';
import { ingestTelemetryEvent } from '@sentinel/services';

type AudioWorkerPhase = 'idle' | 'initializing' | 'running' | 'error';

type UseAudioAnomalyWorkerArgs = {
    configuration?: ExamConfig;
    examSessionId?: string;
    isSuspended?: boolean;
    runtimeConfig?: AudioAnomalySettings | null;
    audioStream?: MediaStream | null;
};

type AudioWorkerResult = {
    errorMessage: string | null;
    isEnabled: boolean;
    phase: AudioWorkerPhase;
};

export function useAudioAnomalyWorker({
    configuration,
    examSessionId,
    isSuspended = false,
    runtimeConfig,
    audioStream,
}: UseAudioAnomalyWorkerArgs): AudioWorkerResult {
    const apiClient = useApi();
    const { user } = useAuth();
    const studentId = user?.id;
    const [phase, setPhase] = useState<AudioWorkerPhase>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isEnabled = Boolean(
        configuration?.micRequired &&
        configuration?.aiRules?.audio_anomaly_detection &&
        examSessionId &&
        studentId &&
        !isSuspended,
    );

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        let isDisposed = false;
        const worker = new Worker(new URL('../workers/audio-anomaly.worker.ts', import.meta.url), {
            type: 'module',
        });
        workerRef.current = worker;

        const eventDefinition = TELEMETRY_EVENT_DEFINITIONS.AUDIO_ANOMALY;

        const stopRuntime = async () => {
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
                initTimeoutRef.current = null;
            }

            processorRef.current?.disconnect();
            processorRef.current = null;
            sourceRef.current?.disconnect();
            sourceRef.current = null;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;

            if (audioContextRef.current) {
                await audioContextRef.current.close().catch(() => undefined);
                audioContextRef.current = null;
            }
        };

        const emitAudioTelemetry = async (
            _anomalyType: AudioAnomalyTypeValue,
            confidenceScore: number,
        ) => {
            if (!examSessionId || !studentId) {
                return;
            }

            await ingestTelemetryEvent(apiClient, {
                examSessionId,
                studentId,
                timestamp: new Date().toISOString(),
                eventType: 'AUDIO_ANOMALY',
                platform: 'WEB',
                source: eventDefinition.source,
                ruleKey: eventDefinition.ruleKey,
                metadata: {
                    confidenceScore,
                    anomalyType: _anomalyType,
                    aggregation: {
                        trigger: 'confidence-threshold',
                        threshold: confidenceScore,
                    },
                },
            });
        };

        worker.onmessage = (event: MessageEvent) => {
            if (isDisposed) {
                return;
            }

            const { type, payload } = event.data as {
                type: string;
                payload?: Record<string, unknown>;
            };

            if (type === 'INIT_SUCCESS') {
                if (initTimeoutRef.current) {
                    clearTimeout(initTimeoutRef.current);
                    initTimeoutRef.current = null;
                }
                worker.postMessage({ type: 'START_DETECTION' });
                setPhase('running');
                return;
            }

            if (type === 'CAPABILITY_FAILURE') {
                if (initTimeoutRef.current) {
                    clearTimeout(initTimeoutRef.current);
                    initTimeoutRef.current = null;
                }
                setPhase('error');
                setErrorMessage(
                    'Audio monitoring is unavailable on this device. The exam will continue without audio anomaly detection.',
                );
                return;
            }

            if (type === 'INIT_FAILURE') {
                if (initTimeoutRef.current) {
                    clearTimeout(initTimeoutRef.current);
                    initTimeoutRef.current = null;
                }
                setPhase('error');
                setErrorMessage(
                    typeof payload?.message === 'string'
                        ? payload.message
                        : 'Audio monitoring could not start for this attempt.',
                );
                return;
            }

            if (
                type === 'ANOMALY_DETECTED' &&
                payload?.anomalies &&
                typeof payload.anomalies === 'object'
            ) {
                const anomalies = payload.anomalies as Record<string, number>;

                for (const [anomalyType, confidenceScore] of Object.entries(anomalies)) {
                    void emitAudioTelemetry(
                        anomalyType as AudioAnomalyTypeValue,
                        confidenceScore,
                    ).catch((error: unknown) => {
                        console.error('Failed to emit audio anomaly telemetry.', {
                            anomalyType,
                            confidenceScore,
                            error,
                        });
                    });
                }
            }
        };

        worker.onerror = () => {
            if (isDisposed) {
                return;
            }

            setPhase('error');
            setErrorMessage(
                'Audio monitoring could not start for this attempt. Existing browser security monitoring remains active.',
            );
        };

        const startRuntime = async () => {
            setPhase('initializing');
            setErrorMessage(null);
            try {
                const stream =
                    audioStream ?? (await navigator.mediaDevices.getUserMedia({ audio: true }));

                if (isDisposed) {
                    if (!audioStream) stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;
                audioContextRef.current = new AudioContext();
                sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

                processorRef.current.onaudioprocess = (audioEvent) => {
                    if (isDisposed) {
                        return;
                    }

                    const samples = new Float32Array(audioEvent.inputBuffer.getChannelData(0));

                    worker.postMessage(
                        {
                            type: 'PROCESS_AUDIO',
                            payload: { samples },
                        },
                        [samples.buffer],
                    );
                };

                sourceRef.current.connect(processorRef.current);
                processorRef.current.connect(audioContextRef.current.destination);

                initTimeoutRef.current = setTimeout(() => {
                    if (isDisposed) {
                        return;
                    }

                    setPhase('error');
                    setErrorMessage(
                        'Audio monitoring took too long to start. The exam will continue without audio anomaly detection.',
                    );

                    worker.terminate();
                    workerRef.current = null;
                    void stopRuntime();
                }, 12_000);

                worker.postMessage({
                    type: 'INIT',
                    payload: {
                        config: runtimeConfig ?? DEFAULT_AUDIO_ANOMALY_CONFIG,
                    },
                });
            } catch (error) {
                if (isDisposed) {
                    return;
                }

                setPhase('error');
                setErrorMessage(
                    'Microphone access was denied or unavailable. Audio monitoring is inactive for this attempt.',
                );
                console.error('Failed to start audio anomaly monitoring.', error);
            }
        };

        void startRuntime();

        return () => {
            isDisposed = true;
            worker.postMessage({ type: 'STOP_DETECTION' });
            worker.terminate();
            workerRef.current = null;
            void stopRuntime();
        };
    }, [apiClient, examSessionId, isEnabled, runtimeConfig, studentId, audioStream]);

    return {
        errorMessage: isEnabled ? errorMessage : null,
        isEnabled,
        phase: isEnabled ? phase : 'idle',
    };
}
