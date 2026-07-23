import type { AudioAnomalySettings, ExamConfig } from '@sentinel/shared';
import type { AudioEngineDetection } from '../../workers/audio-anomaly-engine';

export type AudioWorkerPhase = 'idle' | 'initializing' | 'running' | 'warning' | 'error';

export interface UseAudioAnomalyWorkerArgs {
    configuration?: ExamConfig;
    examSessionId?: string;
    isSuspended?: boolean;
    runtimeConfig?: AudioAnomalySettings | null;
    audioStream?: MediaStream | null;
    worker?: Worker | null;
}

export interface AudioWorkerResult {
    errorMessage: string | null;
    isEnabled: boolean;
    phase: AudioWorkerPhase;
}

export type WorkerOutboundMessage =
    | { type: 'INIT_SUCCESS' }
    | { type: 'CAPABILITY_FAILURE'; payload?: Record<string, unknown> }
    | { type: 'INIT_FAILURE'; payload?: { message: string } }
    | { type: 'ANOMALY_DETECTED'; payload?: AudioEngineDetection };

export interface AudioGraphComponents {
    stream: MediaStream;
    audioContext: AudioContext;
    source: MediaStreamAudioSourceNode;
    processor: ScriptProcessorNode;
}

export interface AudioFramePayload {
    samples: Float32Array;
    sampleRate: number;
}
