import { type incident_severity, type incident_type } from '@sentinel/db';
import { type PersistableProctoringEvent } from '../ingestion/ingestion.dto';

export type TelemetryStorageMapping = {
    incidentType: incident_type;
    severity: incident_severity;
};

export const TELEMETRY_EVENT_TO_INCIDENT_MAP: Partial<
    Record<PersistableProctoringEvent['eventType'], TelemetryStorageMapping>
> = {
    GAZE_OFF_SCREEN: {
        incidentType: 'GAZE',
        severity: 'LOW',
    },
    MULTIPLE_FACES: {
        incidentType: 'MULTIPLE_FACES',
        severity: 'HIGH',
    },
    NO_FACE_DETECTED: {
        incidentType: 'FACE_NOT_VISIBLE',
        severity: 'MEDIUM',
    },
    TAB_SWITCH: {
        incidentType: 'TAB_SWITCH',
        severity: 'MEDIUM',
    },
    FULL_SCREEN_EXIT: {
        incidentType: 'TAB_SWITCH',
        severity: 'MEDIUM',
    },
    CLIPBOARD_ATTEMPT: {
        incidentType: 'SUSPICIOUS_MOVEMENT',
        severity: 'MEDIUM',
    },
    RIGHT_CLICK_ATTEMPT: {
        incidentType: 'SUSPICIOUS_MOVEMENT',
        severity: 'LOW',
    },
    PRINT_SCREEN_ATTEMPT: {
        incidentType: 'SCREENSHOT',
        severity: 'HIGH',
    },
    AUDIO_ANOMALY: {
        incidentType: 'AUDIO_DETECTED',
        severity: 'LOW',
    },
    APP_BACKGROUNDING: {
        incidentType: 'APP_BACKGROUNDING',
        severity: 'HIGH',
    },
    SCREENSHOT_ATTEMPT: {
        incidentType: 'SCREENSHOT',
        severity: 'HIGH',
    },
    ROOT_JAILBREAK_DETECTED: {
        incidentType: 'ROOT_JAILBREAK_DETECTED',
        severity: 'HIGH',
    },
    APP_PINNING_VIOLATION: {
        incidentType: 'APP_PINNING_VIOLATION',
        severity: 'HIGH',
    },
    NOTIFICATION_BLOCK_VIOLATION: {
        incidentType: 'NOTIFICATION_BLOCK_VIOLATION',
        severity: 'MEDIUM',
    },
};
