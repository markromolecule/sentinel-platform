import * as z from 'zod';

const subjectSchemaShape = {
    code: z.string().min(2, 'Code must be at least 2 characters'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
};

export const subjectFormSchema = z.object(subjectSchemaShape);

export const subjectUpdateFormSchema = z.object(subjectSchemaShape).partial();

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
export type SubjectUpdateFormValues = z.infer<typeof subjectUpdateFormSchema>;
