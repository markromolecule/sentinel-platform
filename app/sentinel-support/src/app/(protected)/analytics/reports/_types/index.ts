export type ReportPreset = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'CUSTOM';

export interface ReportRequestInput {
    institutionId: string;
    title: string;
    preset: ReportPreset;
    startDate: string;
    endDate: string;
}
