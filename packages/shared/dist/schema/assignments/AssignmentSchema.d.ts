import * as z from "zod";
export declare const assignmentFormSchema: z.ZodObject<{
    proctorId: z.ZodString;
    examId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
//# sourceMappingURL=AssignmentSchema.d.ts.map