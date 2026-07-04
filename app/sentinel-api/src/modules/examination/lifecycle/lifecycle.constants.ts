export const AUTOMATIC_ATTEMPT_CLOSE_POLICY = {
    thresholdCount: 3,
    windowMinutes: 15,
    reasonCode: 'AUTO_HIGH_INCIDENT_THRESHOLD',
} as const;
