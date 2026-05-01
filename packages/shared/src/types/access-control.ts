export interface AccessControlOverview {
    totalRoles: number;
    systemRoles: number;
    totalPermissions: number;
    customPermissions: number;
    totalAssignments: number;
    totalOverrides: number;
    modulesCovered: number;
    examinationSettingsUpdatedAt: string | Date | null;
}

export interface AccessControlRole {
    id: number;
    name: string;
    description: string | null;
    isSystem: boolean;
    permissionIds: string[];
    permissionCount: number;
    assignmentCount: number;
    createdAt: string | Date | null;
    updatedAt: string | Date | null;
}

export interface AccessControlPermission {
    id: string;
    key: string;
    moduleKey: string;
    actionKey: string;
    category: string | null;
    scope: string | null;
    name: string;
    description: string | null;
    isSystem: boolean;
    roleCount: number;
    overrideCount: number;
    createdAt: string | Date | null;
    updatedAt: string | Date | null;
}

export interface AccessControlAssignment {
    userId: string;
    roleId: number;
    roleName: string;
    userName: string;
    email: string;
    assignedAt: string | Date | null;
}

export interface AccessControlPermissionOverride {
    userId: string;
    permissionId: string;
    effect: 'allow' | 'deny';
    updatedAt: string | Date | null;
}

export interface AccessControlRoleInput {
    name: string;
    description?: string | null;
}

export interface AccessControlPermissionInput {
    key: string;
    moduleKey: string;
    actionKey: string;
    category?: string | null;
    scope?: string | null;
    name: string;
    description?: string | null;
}

export interface AccessControlAssignmentInput {
    userId: string;
    roleId: number;
}

export interface AccessControlRolePermissionInput {
    permissionIds: string[];
}

export interface ExaminationGlobalSettings {
    defaultDurationMinutes: number;
    defaultPassingScore: number;
    defaultShuffleQuestions: boolean;
    defaultShowCorrectAnswers: boolean;
    defaultAllowReview: boolean;
    defaultRandomizeChoices: boolean;
    defaultLobbyAdmissionMode: 'AUTOMATIC' | 'INSTRUCTOR_GATED';
    defaultMaxReconnectAttempts: number;
    defaultStrictMode: boolean;
    defaultCameraRequired: boolean;
    defaultMicRequired: boolean;
    defaultScreenLock: boolean;
    defaultAutoSubmitTimeoutMinutes: number;
    defaultAiRules: {
        gaze_tracking: boolean;
        face_detection: boolean;
        audio_anomaly_detection: boolean;
        multiple_faces_detection: boolean;
    };
    defaultWebSecurity: {
        tab_switching_monitor: boolean;
        full_screen_required: boolean;
        clipboard_control: boolean;
        right_click_disable: boolean;
        print_screen_disable: boolean;
    };
    defaultMobileSecurity: {
        app_pinning_required: boolean;
        prevent_backgrounding: boolean;
        notification_block: boolean;
        screenshot_block: boolean;
        root_jailbreak_detection: boolean;
    };
}

export interface ExaminationGlobalSettingsRecord {
    category: string;
    key: string;
    description: string | null;
    value: ExaminationGlobalSettings;
    updatedAt: string | Date | null;
}
