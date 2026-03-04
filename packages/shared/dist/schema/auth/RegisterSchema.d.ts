import * as z from "zod";
export declare const RegisterSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    terms: z.ZodBoolean;
}, z.core.$strip>;
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
//# sourceMappingURL=RegisterSchema.d.ts.map