import * as z from 'zod';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '../../constants';

export const nullableDateSchema = z.union([z.coerce.date(), z.string()]).nullable();

export const accessControlOverviewSchema = z.object({
    totalRoles: z.number().int(),
    systemRoles: z.number().int(),
    totalPermissions: z.number().int(),
    customPermissions: z.number().int(),
    totalAssignments: z.number().int(),
    totalOverrides: z.number().int(),
    modulesCovered: z.number().int(),
    examinationSettingsUpdatedAt: nullableDateSchema,
});

export const accessControlRoleSchema = z.object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string().nullable(),
    description: z.string().nullable(),
    isSystem: z.boolean(),
    domainScope: z.array(z.string()),
    isActive: z.boolean(),
    assignableBy: z.array(z.string()),
    permissionIds: z.array(z.string().uuid()),
    permissionCount: z.number().int(),
    assignmentCount: z.number().int(),
    createdAt: nullableDateSchema,
    updatedAt: nullableDateSchema,
});

export const accessControlPermissionSchema = z.object({
    id: z.string().uuid(),
    key: z.string(),
    moduleKey: z.string(),
    actionKey: z.string(),
    category: z.string().nullable(),
    scope: z.string().nullable(),
    name: z.string(),
    description: z.string().nullable(),
    isSystem: z.boolean(),
    roleCount: z.number().int(),
    overrideCount: z.number().int(),
    createdAt: nullableDateSchema,
    updatedAt: nullableDateSchema,
});

export const accessControlAssignmentSchema = z.object({
    userId: z.string().uuid(),
    roleId: z.number().int(),
    roleName: z.string(),
    userName: z.string(),
    email: z.string().email(),
    assignedAt: nullableDateSchema,
});

export const examinationGlobalSettingsValueSchema = z.object({
    defaultDurationMinutes: z.number().int(),
    defaultPassingScore: z.number().int(),
    defaultShuffleQuestions: z.boolean(),
    defaultShowCorrectAnswers: z.boolean(),
    defaultAllowReview: z.boolean(),
    defaultRandomizeChoices: z.boolean(),
    defaultLobbyAdmissionMode: z.enum(['AUTOMATIC', 'INSTRUCTOR_GATED']),
    defaultMaxReconnectAttempts: z.number().int(),
    defaultStrictMode: z.boolean(),
    defaultCameraRequired: z.boolean(),
    defaultMicRequired: z.boolean(),
    defaultScreenLock: z.boolean(),
    defaultAutoSubmitTimeoutMinutes: z.number().int(),
    defaultAiRules: z.object({
        gaze_tracking: z.boolean(),
        face_detection: z.boolean(),
        audio_anomaly_detection: z.boolean(),
        multiple_faces_detection: z.boolean(),
    }),
    defaultWebSecurity: z.object({
        tab_switching_monitor: z.boolean(),
        full_screen_required: z.boolean(),
        clipboard_control: z.boolean(),
        right_click_disable: z.boolean(),
        print_screen_disable: z.boolean(),
    }),
    defaultMobileSecurity: z.object({
        app_pinning_required: z.boolean(),
        prevent_backgrounding: z.boolean(),
        notification_block: z.boolean(),
        screenshot_block: z.boolean(),
        root_jailbreak_detection: z.boolean(),
    }),
});

export const examinationGlobalSettingsRecordSchema = z.object({
    category: z.string(),
    key: z.string(),
    description: z.string().nullable(),
    value: examinationGlobalSettingsValueSchema,
    updatedAt: nullableDateSchema,
});

export const accessControlRoleBodySchema = z.object({
    name: z.string().min(2).max(50),
    slug: z
        .string()
        .regex(/^[a-zA-Z0-9-]+$/, 'Slug must be alphanumeric and can contain hyphens')
        .nullable()
        .optional(),
    description: z.string().max(255).nullable().optional(),
    domainScope: z.array(z.string().min(1)).min(1, 'At least one domain scope is required'),
    isActive: z.boolean().default(true).optional(),
    assignableBy: z.array(z.string().min(1)).default([]).optional(),
});

export const accessControlRoleUpdateBodySchema = accessControlRoleBodySchema.partial();

export const accessControlRoleParamsSchema = z.object({
    roleId: z.coerce.number().int(),
});

export const accessControlPermissionBodySchema = z.object({
    key: z.string().min(3).max(120),
    moduleKey: z.string().min(2).max(80),
    actionKey: z.string().min(2).max(80),
    category: z.string().max(80).nullable().optional(),
    scope: z.string().max(50).nullable().optional(),
    name: z.string().min(2).max(120),
    description: z.string().nullable().optional(),
});

export const accessControlPermissionUpdateBodySchema = accessControlPermissionBodySchema.partial();

export const accessControlPermissionParamsSchema = z.object({
    permissionId: z.string().uuid(),
});

export const accessControlRolePermissionsBodySchema = z.object({
    permissionIds: z.array(z.string().uuid()),
});

export const accessControlAssignmentBodySchema = z.object({
    userId: z.string().uuid(),
    roleId: z.number().int(),
});

export const accessControlAssignmentParamsSchema = z.object({
    userId: z.string().uuid(),
    roleId: z.coerce.number().int(),
});

export const examinationGlobalSettingsBodySchema = examinationGlobalSettingsValueSchema.default({
    ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
    defaultAiRules: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultAiRules },
    defaultWebSecurity: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultWebSecurity },
    defaultMobileSecurity: { ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultMobileSecurity },
});

export type AccessControlOverviewSchemaValues = z.infer<typeof accessControlOverviewSchema>;
export type AccessControlRoleSchemaValues = z.infer<typeof accessControlRoleSchema>;
export type AccessControlPermissionSchemaValues = z.infer<typeof accessControlPermissionSchema>;
export type AccessControlAssignmentSchemaValues = z.infer<typeof accessControlAssignmentSchema>;
export type ExaminationGlobalSettingsValueSchemaValues = z.infer<
    typeof examinationGlobalSettingsValueSchema
>;
export type ExaminationGlobalSettingsRecordSchemaValues = z.infer<
    typeof examinationGlobalSettingsRecordSchema
>;
export type AccessControlRoleBodySchemaValues = z.infer<typeof accessControlRoleBodySchema>;
export type AccessControlRoleUpdateBodySchemaValues = z.infer<
    typeof accessControlRoleUpdateBodySchema
>;
export type AccessControlRoleParamsSchemaValues = z.infer<typeof accessControlRoleParamsSchema>;
export type AccessControlPermissionBodySchemaValues = z.infer<
    typeof accessControlPermissionBodySchema
>;
export type AccessControlPermissionUpdateBodySchemaValues = z.infer<
    typeof accessControlPermissionUpdateBodySchema
>;
export type AccessControlPermissionParamsSchemaValues = z.infer<
    typeof accessControlPermissionParamsSchema
>;
export type AccessControlRolePermissionsBodySchemaValues = z.infer<
    typeof accessControlRolePermissionsBodySchema
>;
export type AccessControlAssignmentBodySchemaValues = z.infer<
    typeof accessControlAssignmentBodySchema
>;
export type AccessControlAssignmentParamsSchemaValues = z.infer<
    typeof accessControlAssignmentParamsSchema
>;
