import * as z from 'zod';
/**
 * Base department body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 * Fields use snake_case matching the database contract.
 */
export declare const departmentSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DepartmentFormValues = z.infer<typeof departmentSchema>;
//# sourceMappingURL=department-schema.d.ts.map