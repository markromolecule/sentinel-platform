import { ReportPreset } from '../_types';

export const DEFAULT_PRESET: ReportPreset = 'LAST_30_DAYS';

export const DEFAULT_TIMEZONE = 'Asia/Manila';

export const PRESET_OPTIONS: { value: ReportPreset; label: string }[] = [
    { value: 'LAST_7_DAYS', label: 'Last 7 days' },
    { value: 'LAST_30_DAYS', label: 'Last 30 days' },
    { value: 'LAST_90_DAYS', label: 'Last 90 days' },
    { value: 'CUSTOM', label: 'Custom range' },
];
