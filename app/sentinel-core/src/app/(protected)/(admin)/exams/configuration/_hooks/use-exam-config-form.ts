import { useForm, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { examConfigFormSchema, ExamConfigFormValues } from '@sentinel/shared/schema';
import type { ExamConfig } from '@sentinel/shared/types';

export function useExamConfigForm(args: {
    defaultValues: ExamConfig;
    onSubmit?: (values: ExamConfigFormValues) => Promise<void> | void;
}) {
    const { defaultValues, onSubmit: handleConfigSubmit } = args;

    const form = useForm<ExamConfigFormValues>({
        resolver: zodResolver(examConfigFormSchema) as Resolver<ExamConfigFormValues>,
        defaultValues,
    });

    const onSubmit: SubmitHandler<ExamConfigFormValues> = (values) => {
        handleConfigSubmit?.(values);
        toast.success('Global exam policy updated successfully.');
    };

    return {
        form,
        onSubmit,
    };
}
