import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ProctorExamConfigSchema } from '@sentinel/shared/schema';
import { ProctorExamConfigTypes } from '@sentinel/shared/types';

export function useExamConfigForm({
    defaultValues,
}: ProctorExamConfigTypes.UseExamConfigFormProps) {
    const form = useForm<ProctorExamConfigTypes.FormValues>({
        resolver: zodResolver(ProctorExamConfigSchema.examConfigFormSchema),
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

    const onSubmit: SubmitHandler<ProctorExamConfigSchema.ExamConfigFormValues> = (values) => {
        console.log(values);
        toast.success('Global exam policy updated successfully.');
    };

    return {
        form,
        onSubmit,
    };
}
