export const ACCESS_CONTROL_QUERY_KEYS = {
    all: ['access-control'] as const,
    overview: () => [...ACCESS_CONTROL_QUERY_KEYS.all, 'overview'] as const,
    roles: () => [...ACCESS_CONTROL_QUERY_KEYS.all, 'roles'] as const,
    permissions: () => [...ACCESS_CONTROL_QUERY_KEYS.all, 'permissions'] as const,
    assignments: () => [...ACCESS_CONTROL_QUERY_KEYS.all, 'assignments'] as const,
    examinationSettings: () => [...ACCESS_CONTROL_QUERY_KEYS.all, 'examination-settings'] as const,
};

export const DEFAULT_EXAMINATION_GLOBAL_SETTINGS = {
    defaultDurationMinutes: 60,
    defaultPassingScore: 70,
    defaultShuffleQuestions: false,
    defaultShowCorrectAnswers: false,
    defaultAllowReview: false,
    defaultRandomizeChoices: false,
    defaultMaxReconnectAttempts: 3,
    defaultStrictMode: true,
    defaultCameraRequired: true,
    defaultMicRequired: true,
    defaultScreenLock: true,
    defaultAutoSubmitTimeoutMinutes: 5,
    defaultAllowedDevices: ['desktop', 'laptop'],
} as const;
