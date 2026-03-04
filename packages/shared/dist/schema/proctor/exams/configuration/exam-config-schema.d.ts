import * as z from 'zod';
export declare const examConfigFormSchema: z.ZodObject<{
    name: z.ZodString;
    allowedDevices: z.ZodArray<z.ZodString>;
    cameraRequired: z.ZodBoolean;
    micRequired: z.ZodBoolean;
    aiRules: z.ZodObject<{
        web: z.ZodObject<{
            gazeTracking: z.ZodBoolean;
            audioDetection: z.ZodBoolean;
            tabSwitching: z.ZodBoolean;
            copyPaste: z.ZodBoolean;
            printScreenDisable: z.ZodBoolean;
        }, z.core.$strip>;
        mobile: z.ZodObject<{
            gazeTracking: z.ZodBoolean;
            audioDetection: z.ZodBoolean;
            appPinning: z.ZodBoolean;
            screenshotDisable: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>;
    maxReconnectAttempts: z.ZodNumber;
    autoSubmitTimeout: z.ZodNumber;
}, z.core.$strip>;
export type ExamConfigFormValues = z.infer<typeof examConfigFormSchema>;
//# sourceMappingURL=exam-config-schema.d.ts.map