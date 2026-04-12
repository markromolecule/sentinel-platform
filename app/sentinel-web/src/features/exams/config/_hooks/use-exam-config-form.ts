import { useForm, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProctorExamConfigSchema } from '@sentinel/shared/schema';
import type { ExamConfig } from '@sentinel/shared/types';

export function useExamConfigForm(args: {
    defaultValues: ExamConfig;
    onSubmit: (values: ProctorExamConfigSchema.ExamConfigFormValues) => Promise<void> | void;
}) {
    const { defaultValues, onSubmit: handleConfigSubmit } = args;

    const form = useForm<ProctorExamConfigSchema.ExamConfigFormValues>({
        resolver: zodResolver(
            ProctorExamConfigSchema.examConfigFormSchema,
        ) as Resolver<ProctorExamConfigSchema.ExamConfigFormValues>,
        defaultValues,
    });

    const onSubmit: SubmitHandler<ProctorExamConfigSchema.ExamConfigFormValues> = (values) => {
        return handleConfigSubmit(values);
    };

    return {
        form,
        onSubmit,
    };
}
