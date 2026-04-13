import { useEffect } from 'react';
import { useForm, SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { examConfigurationStateSchema } from '@sentinel/shared/schema';
import type { ExamConfigurationState } from '@sentinel/services';

export function useExamConfigForm(args: {
    defaultValues: ExamConfigurationState;
    onSubmit: (values: ExamConfigurationState) => Promise<void> | void;
}) {
    const { defaultValues, onSubmit: handleConfigSubmit } = args;

    const form = useForm<ExamConfigurationState>({
        resolver: zodResolver(examConfigurationStateSchema) as Resolver<ExamConfigurationState>,
        defaultValues,
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const onSubmit: SubmitHandler<ExamConfigurationState> = (values) => {
        return handleConfigSubmit(values);
    };

    return {
        form,
        onSubmit,
    };
}
