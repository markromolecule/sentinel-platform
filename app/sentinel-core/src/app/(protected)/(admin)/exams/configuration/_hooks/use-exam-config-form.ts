import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { examConfigFormSchema, ExamConfigFormValues } from '@sentinel/shared/schema';
import { AdminExamConfigTypes } from '@sentinel/shared/types';

export function useExamConfigForm({ defaultValues }: AdminExamConfigTypes.UseExamConfigFormProps) {
    const form = useForm<ExamConfigFormValues>({
        resolver: zodResolver(examConfigFormSchema),
        defaultValues: {
            name: defaultValues.name,
            allowedDevices: defaultValues.allowedDevices,
            cameraRequired: defaultValues.cameraRequired,
            micRequired: defaultValues.micRequired,
            aiRules: defaultValues.aiRules,
            maxReconnectAttempts: defaultValues.maxReconnectAttempts,
            autoSubmitTimeout: defaultValues.autoSubmitTimeout,
        },
    });

    const onSubmit: SubmitHandler<ExamConfigFormValues> = (values) => {
        console.log(values);
        toast.success('Global exam policy updated successfully.');
    };

    return {
        form,
        onSubmit,
    };
}
