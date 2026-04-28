import type { ExamConfig } from '@sentinel/shared';
import type {
    WebTelemetryEventType,
    MediaPipeTelemetryEventType,
    WebTelemetryRuleEnabledReader,
} from '../_types';

export const WEB_TELEMETRY_RULE_ENABLED_READERS: Record<
    WebTelemetryEventType,
    WebTelemetryRuleEnabledReader
> = {
    TAB_SWITCH: (configuration) => configuration.webSecurity.tab_switching_monitor,
    FULL_SCREEN_EXIT: (configuration) => configuration.webSecurity.full_screen_required,
    CLIPBOARD_ATTEMPT: (configuration) => configuration.webSecurity.clipboard_control,
    RIGHT_CLICK_ATTEMPT: (configuration) => configuration.webSecurity.right_click_disable,
    PRINT_SCREEN_ATTEMPT: (configuration) => configuration.webSecurity.print_screen_disable,
};

export const MEDIAPIPE_TELEMETRY_RULE_ENABLED_READERS: Record<
    MediaPipeTelemetryEventType,
    (configuration: ExamConfig) => boolean
> = {
    GAZE_OFF_SCREEN: (configuration) => configuration.aiRules.gaze_tracking,
    NO_FACE_DETECTED: (configuration) => configuration.aiRules.face_detection,
    MULTIPLE_FACES: (configuration) => configuration.aiRules.multiple_faces_detection,
};
