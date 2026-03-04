import * as z from 'zod';
export declare const examCreateFormSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    subject_id: z.ZodString;
    duration_minutes: z.ZodNumber;
    passing_score: z.ZodNumber;
    difficulty: z.ZodOptional<z.ZodString>;
    scheduled_date: z.ZodDate;
    scheduled_time: z.ZodString;
}, z.core.$strip>;
export type ExamCreateFormValues = z.infer<typeof examCreateFormSchema>;
//# sourceMappingURL=exam-create-schema.d.ts.map