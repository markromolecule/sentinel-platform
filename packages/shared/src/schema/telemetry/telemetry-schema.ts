import * as z from 'zod';

export const SHARED_TELEMETRY_RULE_KEYS = [
    'aiRules.gaze_tracking',
    'aiRules.face_detection',
    'aiRules.audio_anomaly_detection',
    'aiRules.multiple_faces_detection',
] as const;

export const WEB_TELEMETRY_RULE_KEYS = [
    'webSecurity.tab_switching_monitor',
    'webSecurity.full_screen_required',
    'webSecurity.clipboard_control',
    'webSecurity.right_click_disable',
    'webSecurity.print_screen_disable',
] as const;

export const MOBILE_TELEMETRY_RULE_KEYS = [
    'mobileSecurity.app_pinning_required',
    'mobileSecurity.prevent_backgrounding',
    'mobileSecurity.notification_block',
    'mobileSecurity.screenshot_block',
    'mobileSecurity.root_jailbreak_detection',
] as const;

export const TELEMETRY_RULE_KEYS = [
    ...SHARED_TELEMETRY_RULE_KEYS,
    ...WEB_TELEMETRY_RULE_KEYS,
    ...MOBILE_TELEMETRY_RULE_KEYS,
] as const;

export const TELEMETRY_PLATFORMS = ['WEB', 'MOBILE'] as const;
export const TELEMETRY_SOURCES = ['CLIENT', 'SERVER', 'AI'] as const;

export const SHARED_TELEMETRY_EVENT_TYPES = [
    'GAZE_OFF_SCREEN',
    'MULTIPLE_FACES',
    'NO_FACE_DETECTED',
    'AUDIO_ANOMALY',
] as const;

export const WEB_TELEMETRY_EVENT_TYPES = [
    'TAB_SWITCH',
    'FULL_SCREEN_EXIT',
    'CLIPBOARD_ATTEMPT',
    'RIGHT_CLICK_ATTEMPT',
    'PRINT_SCREEN_ATTEMPT',
] as const;

export const MOBILE_TELEMETRY_EVENT_TYPES = [
    'APP_BACKGROUNDING',
    'SCREENSHOT_ATTEMPT',
    'ROOT_JAILBREAK_DETECTED',
    'APP_PINNING_VIOLATION',
    'NOTIFICATION_BLOCK_VIOLATION',
] as const;

export const TELEMETRY_EVENT_TYPES = [
    ...SHARED_TELEMETRY_EVENT_TYPES,
    ...WEB_TELEMETRY_EVENT_TYPES,
    ...MOBILE_TELEMETRY_EVENT_TYPES,
] as const;

export const TELEMETRY_INCIDENT_TYPES = [
    'FACE_NOT_VISIBLE',
    'MULTIPLE_FACES',
    'TAB_SWITCH',
    'AUDIO_DETECTED',
    'SUSPICIOUS_MOVEMENT',
    'SCREENSHOT',
    'SCREEN_RECORD',
    'GAZE',
    'APP_BACKGROUNDING',
    'ROOT_JAILBREAK_DETECTED',
    'APP_PINNING_VIOLATION',
    'NOTIFICATION_BLOCK_VIOLATION',
] as const;

export const TELEMETRY_INCIDENT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export const TELEMETRY_INCIDENT_STATUSES = [
    'PENDING',
    'REVIEWED',
    'CONFIRMED',
    'DISMISSED',
] as const;

export const telemetryPlatformSchema = z.enum(TELEMETRY_PLATFORMS);
export const telemetrySourceSchema = z.enum(TELEMETRY_SOURCES);
export const telemetryRuleKeySchema = z.enum(TELEMETRY_RULE_KEYS);
export const telemetryEventTypeSchema = z.enum(TELEMETRY_EVENT_TYPES);
export const telemetryIncidentTypeSchema = z.enum(TELEMETRY_INCIDENT_TYPES);
export const telemetryIncidentSeveritySchema = z.enum(TELEMETRY_INCIDENT_SEVERITIES);
export const telemetryIncidentStatusSchema = z.enum(TELEMETRY_INCIDENT_STATUSES);

export type TelemetryPlatform = z.infer<typeof telemetryPlatformSchema>;
export type TelemetrySource = z.infer<typeof telemetrySourceSchema>;
export type TelemetryRuleKey = z.infer<typeof telemetryRuleKeySchema>;
export type TelemetryEventType = z.infer<typeof telemetryEventTypeSchema>;
export type TelemetryIncidentType = z.infer<typeof telemetryIncidentTypeSchema>;
export type TelemetryIncidentSeverity = z.infer<typeof telemetryIncidentSeveritySchema>;
export type TelemetryIncidentStatus = z.infer<typeof telemetryIncidentStatusSchema>;

type TelemetryEventDefinition = {
    platforms: readonly TelemetryPlatform[];
    ruleKey: TelemetryRuleKey;
    source: TelemetrySource;
};

export const TELEMETRY_EVENT_DEFINITIONS = {
    GAZE_OFF_SCREEN: {
        platforms: ['WEB', 'MOBILE'],
        ruleKey: 'aiRules.gaze_tracking',
        source: 'AI',
    },
    MULTIPLE_FACES: {
        platforms: ['WEB', 'MOBILE'],
        ruleKey: 'aiRules.multiple_faces_detection',
        source: 'AI',
    },
    NO_FACE_DETECTED: {
        platforms: ['WEB', 'MOBILE'],
        ruleKey: 'aiRules.face_detection',
        source: 'AI',
    },
    AUDIO_ANOMALY: {
        platforms: ['WEB', 'MOBILE'],
        ruleKey: 'aiRules.audio_anomaly_detection',
        source: 'AI',
    },
    TAB_SWITCH: {
        platforms: ['WEB'],
        ruleKey: 'webSecurity.tab_switching_monitor',
        source: 'CLIENT',
    },
    FULL_SCREEN_EXIT: {
        platforms: ['WEB'],
        ruleKey: 'webSecurity.full_screen_required',
        source: 'CLIENT',
    },
    CLIPBOARD_ATTEMPT: {
        platforms: ['WEB'],
        ruleKey: 'webSecurity.clipboard_control',
        source: 'CLIENT',
    },
    RIGHT_CLICK_ATTEMPT: {
        platforms: ['WEB'],
        ruleKey: 'webSecurity.right_click_disable',
        source: 'CLIENT',
    },
    PRINT_SCREEN_ATTEMPT: {
        platforms: ['WEB'],
        ruleKey: 'webSecurity.print_screen_disable',
        source: 'CLIENT',
    },
    APP_BACKGROUNDING: {
        platforms: ['MOBILE'],
        ruleKey: 'mobileSecurity.prevent_backgrounding',
        source: 'CLIENT',
    },
    SCREENSHOT_ATTEMPT: {
        platforms: ['MOBILE'],
        ruleKey: 'mobileSecurity.screenshot_block',
        source: 'CLIENT',
    },
    ROOT_JAILBREAK_DETECTED: {
        platforms: ['MOBILE'],
        ruleKey: 'mobileSecurity.root_jailbreak_detection',
        source: 'CLIENT',
    },
    APP_PINNING_VIOLATION: {
        platforms: ['MOBILE'],
        ruleKey: 'mobileSecurity.app_pinning_required',
        source: 'CLIENT',
    },
    NOTIFICATION_BLOCK_VIOLATION: {
        platforms: ['MOBILE'],
        ruleKey: 'mobileSecurity.notification_block',
        source: 'CLIENT',
    },
} as const satisfies Record<TelemetryEventType, TelemetryEventDefinition>;

export const TELEMETRY_INCIDENT_LABELS = {
    FACE_NOT_VISIBLE: 'Face Not Visible',
    MULTIPLE_FACES: 'Multiple Faces Detected',
    TAB_SWITCH: 'Tab Switch Detected',
    AUDIO_DETECTED: 'Audio Anomaly',
    SUSPICIOUS_MOVEMENT: 'Suspicious Movement',
    SCREENSHOT: 'Screenshot Attempt',
    SCREEN_RECORD: 'Screen Recording Attempt',
    GAZE: 'Looking Away Detected',
    APP_BACKGROUNDING: 'App Backgrounding',
    ROOT_JAILBREAK_DETECTED: 'Root / Jailbreak Detected',
    APP_PINNING_VIOLATION: 'App Pinning Violation',
    NOTIFICATION_BLOCK_VIOLATION: 'Notification Block Violation',
} as const satisfies Record<TelemetryIncidentType, string>;

export const telemetryAggregationMetadataSchema = z
    .object({
        trigger: z.enum([
            'immediate',
            'duration-threshold',
            'repeat-threshold',
            'confidence-threshold',
        ]),
        occurrenceCount: z.number().int().positive().optional(),
        windowSeconds: z.number().int().positive().optional(),
        threshold: z.number().positive().optional(),
    })
    .strict();

export const telemetryMetadataSchema = z
    .object({
        durationMs: z.number().int().nonnegative().optional(),
        confidenceScore: z.number().min(0).max(1).optional(),
        aggregation: telemetryAggregationMetadataSchema.optional(),
    })
    .strict();

export const telemetrySessionContextSchema = z
    .object({
        browser: z.string().trim().min(1).max(100).optional(),
        os: z.string().trim().min(1).max(100).optional(),
        deviceType: z.enum(['DESKTOP', 'TABLET', 'MOBILE']).optional(),
        appVersion: z.string().trim().min(1).max(50).optional(),
        clientVersion: z.string().trim().min(1).max(50).optional(),
        clientCapabilities: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    })
    .strict();

export const telemetrySeverityReasonSchema = z.enum([
    'default-ladder',
    'repeat-escalated',
    'forced-override',
    'immediate-high',
    'threshold-fixed',
]);

export const telemetrySeverityInputsSchema = z
    .object({
        baseSeverity: telemetryIncidentSeveritySchema,
        ladder: z.array(telemetryIncidentSeveritySchema).min(1),
        matchingCount: z.number().int().positive(),
        matchingWindowSeconds: z.number().int().positive().nullable().optional(),
        repeatThreshold: z.number().int().positive().nullable().optional(),
        overrideSeverity: telemetryIncidentSeveritySchema.nullable().optional(),
    })
    .strict();

export const telemetryIncidentLastEventSchema = z
    .object({
        eventType: telemetryEventTypeSchema,
        timestamp: z.union([z.coerce.date(), z.string()]).nullable().optional(),
        metadata: z
            .object({
                durationMs: z.number().int().nonnegative().optional(),
                confidenceScore: z.number().min(0).max(1).optional(),
                aggregation: telemetryAggregationMetadataSchema.optional(),
            })
            .passthrough()
            .nullable()
            .optional(),
    })
    .strict();

export const telemetryRuntimeRuleOverrideSnapshotSchema = z
    .object({
        enabled: z.boolean().optional(),
        severity: telemetryIncidentSeveritySchema.optional(),
        confidenceThreshold: z.number().min(0).max(1).optional(),
        durationThresholdMs: z.number().int().min(1).max(600_000).optional(),
        repeatThreshold: z.number().int().min(1).max(100).optional(),
    })
    .strict();

export const telemetryRuntimeSettingsSnapshotSchema = z
    .object({
        version: z.number().int().positive().nullable().optional(),
        ruleOverrideApplied: telemetryRuntimeRuleOverrideSnapshotSchema.nullable().optional(),
    })
    .strict();

export const telemetryConfigurationSnapshotSchema = z
    .object({
        cameraRequired: z.boolean().optional(),
        micRequired: z.boolean().optional(),
        aiRules: z
            .object({
                gaze_tracking: z.boolean().optional(),
                face_detection: z.boolean().optional(),
                audio_anomaly_detection: z.boolean().optional(),
                multiple_faces_detection: z.boolean().optional(),
            })
            .partial()
            .optional(),
        webSecurity: z
            .object({
                tab_switching_monitor: z.boolean().optional(),
                full_screen_required: z.boolean().optional(),
                clipboard_control: z.boolean().optional(),
                right_click_disable: z.boolean().optional(),
                print_screen_disable: z.boolean().optional(),
            })
            .partial()
            .optional(),
        mobileSecurity: z
            .object({
                app_pinning_required: z.boolean().optional(),
                prevent_backgrounding: z.boolean().optional(),
                notification_block: z.boolean().optional(),
                screenshot_block: z.boolean().optional(),
                root_jailbreak_detection: z.boolean().optional(),
            })
            .partial()
            .optional(),
    })
    .strict();

export const telemetryIncidentMetadataSchema = z
    .object({
        durationMs: z.number().int().nonnegative().optional(),
        confidenceScore: z.number().min(0).max(1).optional(),
        aggregation: telemetryAggregationMetadataSchema.optional(),
    })
    .passthrough();

export const telemetryIncidentDetailsSchema = z
    .object({
        eventType: telemetryEventTypeSchema,
        metadata: telemetryIncidentMetadataSchema.nullable().optional(),
        telemetrySettings: telemetryRuntimeSettingsSnapshotSchema.nullable().optional(),
        occurrenceCount: z.number().int().positive().optional(),
        severityReason: telemetrySeverityReasonSchema.optional(),
        severityInputs: telemetrySeverityInputsSchema.optional(),
        previousSeverity: telemetryIncidentSeveritySchema.nullable().optional(),
        currentSeverity: telemetryIncidentSeveritySchema.nullable().optional(),
        lastEvent: telemetryIncidentLastEventSchema.nullable().optional(),
    })
    .passthrough();

export const telemetryIncidentSchema = z.object({
    incidentId: z.string().uuid(),
    attemptId: z.string().uuid().nullable(),
    examId: z.string().uuid().nullable(),
    examTitle: z.string().nullable(),
    institutionId: z.string().uuid().nullable(),
    studentId: z.string().uuid().nullable(),
    studentRecordId: z.string().uuid().nullable(),
    studentName: z.string().nullable(),
    platform: telemetryPlatformSchema.nullable(),
    source: telemetrySourceSchema.nullable(),
    ruleKey: telemetryRuleKeySchema.nullable(),
    incidentType: telemetryIncidentTypeSchema,
    severity: telemetryIncidentSeveritySchema.nullable(),
    status: telemetryIncidentStatusSchema.nullable(),
    timestamp: z.union([z.coerce.date(), z.string()]).nullable(),
    evidenceUrl: z.string().nullable(),
    reviewedBy: z.string().uuid().nullable(),
    reviewedAt: z.union([z.coerce.date(), z.string()]).nullable(),
    reviewNotes: z.string().nullable(),
    configurationSnapshot: telemetryConfigurationSnapshotSchema.nullable(),
    sessionContext: telemetrySessionContextSchema.nullable(),
    details: telemetryIncidentDetailsSchema.nullable(),
});

export const telemetryEventIngestionRequestSchema = z
    .object({
        platform: telemetryPlatformSchema,
        source: telemetrySourceSchema,
        ruleKey: telemetryRuleKeySchema,
        eventType: telemetryEventTypeSchema,
        metadata: telemetryMetadataSchema.optional(),
        sessionContext: telemetrySessionContextSchema.optional(),
    })
    .strict();

export type TelemetryMetadata = z.infer<typeof telemetryMetadataSchema>;
export type TelemetrySessionContext = z.infer<typeof telemetrySessionContextSchema>;
export type TelemetryAggregationMetadata = z.infer<typeof telemetryAggregationMetadataSchema>;
export type TelemetrySeverityReason = z.infer<typeof telemetrySeverityReasonSchema>;
export type TelemetrySeverityInputs = z.infer<typeof telemetrySeverityInputsSchema>;
export type TelemetryConfigurationSnapshot = z.infer<typeof telemetryConfigurationSnapshotSchema>;
export type TelemetryIncidentDetails = z.infer<typeof telemetryIncidentDetailsSchema>;
export type TelemetryIncidentRecord = z.infer<typeof telemetryIncidentSchema>;
export type TelemetryEventIngestionRequest = z.infer<typeof telemetryEventIngestionRequestSchema>;
