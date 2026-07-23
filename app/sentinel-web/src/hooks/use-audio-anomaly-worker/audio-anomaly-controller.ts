import {
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    checkAudioCapabilities,
    type AudioAnomalySettings,
} from '@sentinel/shared';

import { INIT_TIMEOUT_MS } from './_constants';
import { createAudioGraph } from './create-audio-graph';
import type { AudioWorkerPhase, AudioFramePayload, WorkerOutboundMessage } from './_types';
import type { AudioEngineDetection } from '../../workers/audio-anomaly-engine';

export interface AudioAnomalyControllerConfig {
    audioStream?: MediaStream | null;
    providedWorker?: Worker | null;
    runtimeConfig?: AudioAnomalySettings | null;
    onPhaseChange: (phase: AudioWorkerPhase) => void;
    onErrorMessage: (msg: string | null) => void;
    onAnomaly: (detection: AudioEngineDetection) => void;
}

/**
 * Controller class to manage the Web Audio API graph and Web Worker lifecycle.
 * Decouples the low-level API management from the React hook rendering cycle.
 */
export class AudioAnomalyController {
    private worker: Worker | null = null;
    private isOwnWorker = false;
    private audioContext: AudioContext | null = null;
    private stream: MediaStream | null = null;
    private ownsStream = false;
    private processor: ScriptProcessorNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private initTimeout: ReturnType<typeof setTimeout> | null = null;
    private isDisposed = false;

    private retryCount = 0;
    private maxRetries = 5;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(private config: AudioAnomalyControllerConfig) {}

    /**
     * Initializes capabilities, constructs the audio graph, connects the worker,
     * and sets up message handlers and timeout guards.
     */
    public async start(): Promise<void> {
        this.isDisposed = false;
        if (this.retryCount === 0) {
            this.config.onPhaseChange('initializing');
        }
        this.config.onErrorMessage(null);

        // 1. Resolve or construct Worker
        if (this.config.providedWorker) {
            this.worker = this.config.providedWorker;
            this.isOwnWorker = false;
        } else {
            this.worker = new Worker(
                new URL('../../workers/audio-anomaly.worker.ts', import.meta.url),
                { type: 'module' },
            );
            this.isOwnWorker = true;
        }

        // 2. Attach listeners
        this.worker.addEventListener('message', this.handleMessage);
        this.worker.addEventListener('error', this.handleError);

        try {
            // 3. Check audio support
            const capabilities = await checkAudioCapabilities();
            if (!capabilities.webAudioSupported) {
                this.config.onPhaseChange('error');
                this.config.onErrorMessage(
                    'Audio monitoring is unavailable on this device. The exam will continue without audio anomaly detection.',
                );
                return;
            }

            // 4. Check if provided stream has live tracks
            if (this.config.audioStream) {
                const tracks = this.config.audioStream.getAudioTracks
                    ? this.config.audioStream.getAudioTracks()
                    : this.config.audioStream.getTracks();
                if (!tracks.some((track) => track.readyState === 'live')) {
                    this.config.onPhaseChange('error');
                    this.config.onErrorMessage('No live audio tracks available.');
                    return;
                }
            }

            // 4b. Create Web Audio components
            const graph = await createAudioGraph(
                this.config.audioStream,
                this.worker,
                ({ samples, sampleRate }: AudioFramePayload) => {
                    if (this.isDisposed || !this.worker) return;
                    this.worker.postMessage(
                        {
                            type: 'PROCESS_AUDIO',
                            payload: { samples, sampleRate },
                        },
                        [samples.buffer],
                    );
                },
            );

            if (this.isDisposed) {
                if (!this.config.audioStream) {
                    graph.stream.getTracks().forEach((track) => track.stop());
                }
                await graph.audioContext.close().catch(() => undefined);
                return;
            }

            this.stream = graph.stream;
            this.ownsStream = !this.config.audioStream;
            this.audioContext = graph.audioContext;
            this.source = graph.source;
            this.processor = graph.processor;

            // 5. Start timeout guard
            this.initTimeout = setTimeout(() => {
                if (this.isDisposed) return;
                this.triggerRetry('Audio monitoring took too long to start.');
            }, INIT_TIMEOUT_MS);

            // 6. Post INIT message to worker
            this.worker.postMessage({
                type: 'INIT',
                payload: {
                    config: this.config.runtimeConfig ?? DEFAULT_AUDIO_ANOMALY_CONFIG,
                },
            });
        } catch (error) {
            if (this.isDisposed) return;

            const isPermissionError =
                error instanceof Error &&
                (error.name === 'NotAllowedError' ||
                    error.name === 'PermissionDeniedError' ||
                    error.message.toLowerCase().includes('denied') ||
                    error.message.toLowerCase().includes('permission'));

            if (isPermissionError) {
                this.config.onPhaseChange('error');
                this.config.onErrorMessage(
                    'Microphone access was denied or unavailable. Audio monitoring is inactive for this attempt.',
                );
            } else {
                this.triggerRetry('Microphone access failed.');
            }
            console.error('Failed to start audio anomaly monitoring.', error);
        }
    }

    /**
     * Updates the detection settings inside the running worker instance.
     */
    public updateConfig(runtimeConfig: AudioAnomalySettings | null | undefined): void {
        if (!this.worker || this.isDisposed) return;
        this.worker.postMessage({
            type: 'UPDATE_CONFIG',
            payload: { config: runtimeConfig ?? DEFAULT_AUDIO_ANOMALY_CONFIG },
        });
    }

    /**
     * Stops detection, cleans up event listeners, terminates self-managed worker,
     * and releases Web Audio resources.
     */
    public dispose(): void {
        this.isDisposed = true;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.worker) {
            this.worker.postMessage({ type: 'STOP_DETECTION' });
            this.worker.removeEventListener('message', this.handleMessage);
            this.worker.removeEventListener('error', this.handleError);

            if (this.isOwnWorker) {
                this.worker.terminate();
            }
            this.worker = null;
        }

        void this.stopRuntime();
    }

    private clearInitTimeout = (): void => {
        if (this.initTimeout) {
            clearTimeout(this.initTimeout);
            this.initTimeout = null;
        }
    };

    private stopRuntime = async (): Promise<void> => {
        this.clearInitTimeout();

        this.processor?.disconnect();
        this.processor = null;
        this.source?.disconnect();
        this.source = null;

        if (this.ownsStream) {
            this.stream?.getTracks().forEach((track) => track.stop());
        }
        this.stream = null;
        this.ownsStream = false;

        if (this.audioContext) {
            await this.audioContext.close().catch(() => undefined);
            this.audioContext = null;
        }
    };

    private triggerRetry(errorMsg: string): void {
        if (this.isDisposed) return;
        this.clearInitTimeout();

        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.config.onPhaseChange('warning');
            this.config.onErrorMessage(
                `${errorMsg} Reconnecting (Attempt ${this.retryCount}/${this.maxRetries})...`,
            );

            void this.stopRuntime();
            if (this.worker && this.isOwnWorker) {
                this.worker.postMessage({ type: 'STOP_DETECTION' });
                this.worker.removeEventListener('message', this.handleMessage);
                this.worker.removeEventListener('error', this.handleError);
                this.worker.terminate();
                this.worker = null;
            }

            const delay = Math.pow(2, this.retryCount) * 1000;
            this.reconnectTimeout = setTimeout(() => {
                void this.start();
            }, delay);
        } else {
            this.config.onPhaseChange('error');
            this.config.onErrorMessage(
                `Failed to establish audio connection after ${this.maxRetries} attempts. ${errorMsg}`,
            );
            void this.stopRuntime();
        }
    }

    private handleMessage = (event: MessageEvent): void => {
        if (this.isDisposed) return;

        const data = event.data as WorkerOutboundMessage;

        switch (data.type) {
            case 'INIT_SUCCESS':
                this.clearInitTimeout();
                this.retryCount = 0;
                if (this.worker) {
                    this.worker.postMessage({ type: 'START_DETECTION' });
                }
                this.config.onPhaseChange('running');
                break;

            case 'CAPABILITY_FAILURE':
                this.clearInitTimeout();
                this.config.onPhaseChange('error');
                this.config.onErrorMessage(
                    'Audio monitoring is unavailable on this device. The exam will continue without audio anomaly detection.',
                );
                break;

            case 'INIT_FAILURE':
                this.clearInitTimeout();
                this.triggerRetry(
                    data.payload?.message ?? 'Audio monitoring could not start for this attempt.',
                );
                break;

            case 'ANOMALY_DETECTED':
                if (data.payload) {
                    this.config.onAnomaly(data.payload);
                }
                break;
        }
    };

    private handleError = (): void => {
        if (this.isDisposed) return;
        this.triggerRetry('Audio worker encountered an error.');
    };
}
