import * as z from 'zod';

export const examConfigFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'Policy name must be at least 2 characters.' })
        .max(50, { message: 'Policy name cannot exceed 50 characters.' }),
    allowedDevices: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: 'You have to select at least one device.',
    }),
    cameraRequired: z.boolean(),
    micRequired: z.boolean(),
    aiRules: z.object({
        web: z.object({
            gazeTracking: z.boolean(),
            audioDetection: z.boolean(),
            tabSwitching: z.boolean(),
            copyPaste: z.boolean(),
            printScreenDisable: z.boolean(),
        }),
        mobile: z.object({
            gazeTracking: z.boolean(),
            audioDetection: z.boolean(),
            appPinning: z.boolean(),
            screenshotDisable: z.boolean(),
        }),
    }),
    maxReconnectAttempts: z
        .number()
        .min(1, { message: 'Max reconnect attempts must be at least 1.' })
        .max(5, { message: 'Max reconnect attempts cannot exceed 5.' }),
    autoSubmitTimeout: z
        .number()
        .min(1, { message: 'Auto submit timeout must be at least 1.' })
        .max(60, { message: 'Auto submit timeout cannot exceed 60.' }),
});

export type ExamConfigFormValues = z.infer<typeof examConfigFormSchema>;
