import { type PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import { type ExamConfigurationValues } from '../../../examination/configuration/services/configuration.types';
import { type TelemetryConfigurationSnapshot } from '@sentinel/shared';

/**
 * Builds a snapshot of the exam configuration relevant to a specific telemetry rule.
 */
export function buildTelemetryConfigurationSnapshot(
    ruleKey: PersistableProctoringEvent['ruleKey'],
    configuration?: ExamConfigurationValues | null,
): TelemetryConfigurationSnapshot | null {
    if (!configuration) {
        return null;
    }

    switch (ruleKey) {
        case 'aiRules.gaze_tracking':
        case 'aiRules.face_detection':
        case 'aiRules.multiple_faces_detection':
            return {
                cameraRequired: configuration.cameraRequired,
                aiRules: {
                    gaze_tracking: configuration.aiRules.gaze_tracking,
                    face_detection: configuration.aiRules.face_detection,
                    multiple_faces_detection: configuration.aiRules.multiple_faces_detection,
                },
            };
        case 'aiRules.audio_anomaly_detection':
            return {
                micRequired: configuration.micRequired,
                aiRules: {
                    audio_anomaly_detection: configuration.aiRules.audio_anomaly_detection,
                },
            };
        case 'webSecurity.tab_switching_monitor':
            return {
                webSecurity: {
                    tab_switching_monitor: configuration.webSecurity.tab_switching_monitor,
                },
            };
        case 'webSecurity.full_screen_required':
            return {
                webSecurity: {
                    full_screen_required: configuration.webSecurity.full_screen_required,
                },
            };
        case 'webSecurity.clipboard_control':
            return {
                webSecurity: {
                    clipboard_control: configuration.webSecurity.clipboard_control,
                },
            };
        case 'webSecurity.right_click_disable':
            return {
                webSecurity: {
                    right_click_disable: configuration.webSecurity.right_click_disable,
                },
            };
        case 'webSecurity.print_screen_disable':
            return {
                webSecurity: {
                    print_screen_disable: configuration.webSecurity.print_screen_disable,
                },
            };
        case 'mobileSecurity.app_pinning_required':
            return {
                mobileSecurity: {
                    app_pinning_required: configuration.mobileSecurity.app_pinning_required,
                },
            };
        case 'mobileSecurity.prevent_backgrounding':
            return {
                mobileSecurity: {
                    prevent_backgrounding: configuration.mobileSecurity.prevent_backgrounding,
                },
            };
        case 'mobileSecurity.notification_block':
            return {
                mobileSecurity: {
                    notification_block: configuration.mobileSecurity.notification_block,
                },
            };
        case 'mobileSecurity.screenshot_block':
            return {
                mobileSecurity: {
                    screenshot_block: configuration.mobileSecurity.screenshot_block,
                },
            };
        case 'mobileSecurity.root_jailbreak_detection':
            return {
                mobileSecurity: {
                    root_jailbreak_detection: configuration.mobileSecurity.root_jailbreak_detection,
                },
            };
        default:
            return null;
    }
}
