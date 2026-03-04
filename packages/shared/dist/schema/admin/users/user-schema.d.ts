import * as z from "zod";
export declare const userFormSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<{
        admin: "admin";
        proctor: "proctor";
        student: "student";
        instructor: "instructor";
    }>;
    department: z.ZodString;
    studentNo: z.ZodOptional<z.ZodString>;
    institution: z.ZodString;
}, z.core.$strip>;
export type UserFormValues = z.infer<typeof userFormSchema>;
//# sourceMappingURL=user-schema.d.ts.map