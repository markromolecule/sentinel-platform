import { useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectFormSchema, SubjectFormValues } from '@sentinel/shared/schema';
import { useSubjectStore } from '@/stores/use-subject-store';
import { toast } from 'sonner';
import { UseAddSubjectFormReturn } from './_types';

export function useAddSubjectForm(): UseAddSubjectFormReturn {
    const [open, setOpen] = useState(false);
    const addMasterSubject = useSubjectStore((state) => state.addMasterSubject);

    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    const toggleSection = useCallback((sectionName: string) => {
        setSelectedSections((prev) =>
            prev.includes(sectionName)
                ? prev.filter((s) => s !== sectionName)
                : [...prev, sectionName],
        );
    }, []);

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectFormSchema),
        defaultValues: {
            code: '',
            title: '',
            section: 'N/A', // Default or hidden
            department: '',
            yearLevel: '1st Year',
        },
    });

    const onSubmit = useCallback(
        (values: SubjectFormValues) => {
            addMasterSubject({
                code: values.code,
                title: values.title,
                department: values.department,
                yearLevel: values.yearLevel,
                sections: selectedSections,
            });
            setSelectedSections([]);
            toast.success(`Subject ${values.code} added to Master Catalog`);
            setOpen(false);
            form.reset();
        },
        [addMasterSubject, selectedSections, form],
    );

    const watchedDepartment = useWatch({
        control: form.control,
        name: 'department',
    });

    return {
        form,
        onSubmit,
        selectedSections,
        toggleSection,
        watchedDepartment,
        open,
        setOpen,
    };
}
