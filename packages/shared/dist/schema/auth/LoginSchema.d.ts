import * as z from "zod";
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    remember: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;
//# sourceMappingURL=LoginSchema.d.ts.map