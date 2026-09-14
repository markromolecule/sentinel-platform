export type MobileMediaPipeBridgeProps = {
  onLandmarksDetected: (landmarksByFace: any[][], confidenceScore: number) => void;
  onStatusChange?: (status: 'initializing' | 'ready') => void;
  onError?: (error: string) => void;
  onInspectionStatusChange?: (status: 'connected' | 'disconnected' | 'error', error?: string) => void;
  frameIntervalMs?: number;
  facing?: 'front' | 'back';
  showPreview?: boolean;
};

export type MobileMediaPipeBridgeRef = {
  takePictureAsync: (options?: { quality?: number }) => Promise<{ uri: string; base64: string }>;
  startLiveInspection: (credentials: { liveKitUrl: string; token: string }) => Promise<void>;
  stopLiveInspection: () => Promise<void>;
};

export type BridgeInboundMessage =
  | { type: 'landmarks'; landmarks: any[][]; confidenceScore: number }
  | { type: 'status'; status: 'initializing' | 'ready' }
  | { type: 'error'; error: string }
  | { type: 'inspection_status'; status: 'connected' | 'disconnected' | 'error'; error?: string }
  | { type: 'capture_result'; requestId: string; base64Image: string }
  | { type: 'capture_error'; requestId: string; error: string };

export type BridgeOutboundMessage =
  | { type: 'configure'; frameIntervalMs?: number; facingMode?: 'user' | 'environment' }
  | { type: 'start_inspection'; liveKitUrl: string; token: string }
  | { type: 'stop_inspection' }
  | { type: 'capture'; requestId: string; quality: number };
