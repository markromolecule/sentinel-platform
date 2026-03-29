import { UseFormReturn } from 'react-hook-form';
import { type InstructorSubjectEnrollmentFormValues } from '@sentinel/shared/schema';

export interface UseAddSubjectFormReturn {
    form: UseFormReturn<InstructorSubjectEnrollmentFormValues>;
    onSubmit: (values: InstructorSubjectEnrollmentFormValues) => void;
    isPending: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
}
