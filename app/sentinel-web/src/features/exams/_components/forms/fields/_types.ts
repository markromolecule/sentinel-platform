import type { Control } from 'react-hook-form';
import type { ExamCreateFormValues } from '@sentinel/shared/schema';

export type ExamFormFieldProps = {
    control: Control<ExamCreateFormValues>;
};
