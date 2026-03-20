import * as z from "zod";

export const assignmentFormSchema = z.object({
    instructorId: z.string().min(1, "Instructor is required"),
    examId: z.string().min(1, "Exam is required"),
    notes: z.string().optional(),
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
