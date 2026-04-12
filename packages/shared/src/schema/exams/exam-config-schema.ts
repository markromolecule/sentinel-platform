import * as z from 'zod';
import { examConfigurationSchema } from './assessment-schema';

export const examConfigFormSchema = examConfigurationSchema;

export type ExamConfigFormValues = z.infer<typeof examConfigFormSchema>;
