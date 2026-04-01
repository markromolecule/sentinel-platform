import { UseFormReturn } from 'react-hook-form';
import { SubjectFormValues } from '@sentinel/shared/schema';

export interface SubjectFormFieldsProps {
    form: UseFormReturn<SubjectFormValues>;
    variant?: 'default' | 'compact';
}
