import { z } from 'zod';
import { examConfigFormSchema } from '../../../../schema/exams/exam-config-schema';
import { ExamConfig } from '../../../index';

export type FormValues = z.infer<typeof examConfigFormSchema>;

export interface UseExamConfigFormProps {
    defaultValues: ExamConfig;
}
