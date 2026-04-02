export const ONBOARDING_CONSTANTS = {
    STUDENT_NUMBER_MAX_LENGTH: 12,
    FORMATTED_STUDENT_NUMBER_LENGTH: 11, // 4-7 format (e.g., 2023-123456)
    VERIFICATION_RULES: [
        'Student number must exist in the approved whitelist for your institution.',
        'Last name must match your official whitelist record.',
        'Institution, department, and course must match your approved academic record.',
    ],
} as const;
