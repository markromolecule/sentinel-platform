import type { ApiClientType } from '@sentinel/services';
import type { SentinelSupabaseClient } from '../auth-provider';

export type StudentLiveInspectionPublisherStatus =
    'idle' | 'requested' | 'connecting' | 'live' | 'failed';

export type StudentLiveInspectionPublisherFailureCode =
    | 'NO_LIVE_CAMERA_TRACK'
    | 'LIVEKIT_CONNECT_FAILED'
    | 'LIVEKIT_PUBLISH_FAILED'
    | 'LIVEKIT_RUNTIME_LOST';

export type UseStudentLiveInspectionPublisherArgs = {
    supabase: SentinelSupabaseClient | null;
    apiClient: ApiClientType;
    sessionId: string | null | undefined;
    attemptId: string | null | undefined;
    enabled: boolean;
    getLiveVideoTrack: () => MediaStreamTrack | null;
    onStatusChange?: (status: StudentLiveInspectionPublisherStatus) => void;
    onFailure?: (code: StudentLiveInspectionPublisherFailureCode) => void;
};
