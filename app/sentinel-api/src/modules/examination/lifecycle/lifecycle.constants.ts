export const AUTOMATIC_ATTEMPT_CLOSE_POLICY = {
    thresholdCount: 3,
    windowMinutes: 15,
    reasonCode: 'AUTO_HIGH_INCIDENT_THRESHOLD',
} as const;

export const REMEDIATION_REQUIRES_EXAM_END_PASSED = false;
export const ALLOW_MAKEUP_OVER_IN_PROGRESS = false;
