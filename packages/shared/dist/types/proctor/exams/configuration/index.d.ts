import { z } from 'zod';
import { examConfigFormSchema } from '../../../../schema/proctor/exams/configuration/exam-config-schema';
import { ExamConfig } from '../../../index';
export type FormValues = z.infer<typeof examConfigFormSchema>;
export interface UseExamConfigFormProps {
    defaultValues: ExamConfig;
}
//# sourceMappingURL=index.d.ts.map