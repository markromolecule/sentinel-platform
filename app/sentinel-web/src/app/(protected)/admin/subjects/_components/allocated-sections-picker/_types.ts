import { UseFormReturn } from 'react-hook-form';
import { SubjectFormValues } from '@sentinel/shared/schema';

export interface AllocatedSectionsPickerProps {
    form: UseFormReturn<SubjectFormValues>;
}
