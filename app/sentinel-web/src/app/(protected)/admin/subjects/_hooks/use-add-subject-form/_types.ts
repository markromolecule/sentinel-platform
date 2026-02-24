import { UseFormReturn } from 'react-hook-form';
import { SubjectFormValues } from '@sentinel/shared/schema';

export interface UseAddSubjectFormReturn {
    form: UseFormReturn<SubjectFormValues>;
    onSubmit: (values: SubjectFormValues) => void;
    selectedSections: string[];
    toggleSection: (sectionName: string) => void;
    watchedDepartment: string | undefined;
    open: boolean;
    setOpen: (open: boolean) => void;
}
