import type {
    AudioAnomalyConfigRecordSchemaValues,
    AudioAnomalyConfigSchemaValues,
    AudioAnomalyConfigUpdateSchemaValues,
    AudioAnomalyThresholdsSchemaValues,
    AudioAnomalyTypeSchemaValues,
} from '../schema/audio/audio-settings-schema';

export type AudioAnomalyTypeValue = AudioAnomalyTypeSchemaValues;
export type AudioAnomalySettingsThresholds = AudioAnomalyThresholdsSchemaValues;
export type AudioAnomalySettings = AudioAnomalyConfigSchemaValues;
export type AudioAnomalySettingsUpdate = AudioAnomalyConfigUpdateSchemaValues;
export type AudioAnomalySettingsRecord = AudioAnomalyConfigRecordSchemaValues;
