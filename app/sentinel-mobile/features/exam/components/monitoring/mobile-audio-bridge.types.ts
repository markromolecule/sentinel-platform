import type { AudioAnomalyConfig, AudioAnomalyType } from '@sentinel/shared';

export type AudioBridgeStatus =
    | 'idle'
    | 'initializing'
    | 'ready'
    | 'running'
    | 'stopped'
    | 'error';

export type AudioBridgeError = {
    code: 'permission_denied' | 'model_load_failed' | 'audio_context_failed' | 'unknown';
    message: string;
};

export type QualifiedAudioAnomaly = {
    anomalyType: AudioAnomalyType;
    confidenceScore: number;
    detectedAt: string;
};

export type BridgeInboundMessage =
    | {
          type: 'status';
          status: AudioBridgeStatus;
      }
    | {
          type: 'anomaly';
          anomalyType: AudioAnomalyType;
          confidenceScore: number;
          detectedAt: string;
      }
    | {
          type: 'error';
          error: AudioBridgeError;
      };

export type BridgeOutboundMessage =
    | {
          type: 'start';
      }
    | {
          type: 'stop';
      }
    | {
          type: 'update_config';
          config: AudioAnomalyConfig;
      };

export interface MobileAudioBridgeProps {
    enabled: boolean;
    config?: AudioAnomalyConfig;
    modelUrl?: string;
    onAnomalyDetected: (anomaly: QualifiedAudioAnomaly) => void;
    onStatusChange?: (status: AudioBridgeStatus) => void;
    onError?: (error: AudioBridgeError) => void;
}
