import * as z from 'zod';
export declare const examConfigFormSchema: z.ZodObject<{
    name: z.ZodString;
    allowedDevices: z.ZodArray<z.ZodString>;
    cameraRequired: z.ZodDefault<z.ZodBoolean>;
    micRequired: z.ZodDefault<z.ZodBoolean>;
    aiRules: z.ZodObject<{
        web: z.ZodObject<{
            gazeTracking: z.ZodDefault<z.ZodBoolean>;
            audioDetection: z.ZodDefault<z.ZodBoolean>;
            tabSwitching: z.ZodDefault<z.ZodBoolean>;
            copyPaste: z.ZodDefault<z.ZodBoolean>;
            printScreenDisable: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
        mobile: z.ZodObject<{
            gazeTracking: z.ZodDefault<z.ZodBoolean>;
            audioDetection: z.ZodDefault<z.ZodBoolean>;
            appPinning: z.ZodDefault<z.ZodBoolean>;
            screenshotDisable: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    maxReconnectAttempts: z.ZodCoercedNumber<unknown>;
    autoSubmitTimeout: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type ExamConfigFormValues = z.infer<typeof examConfigFormSchema>;
//# sourceMappingURL=ExamConfigSchema.d.ts.map