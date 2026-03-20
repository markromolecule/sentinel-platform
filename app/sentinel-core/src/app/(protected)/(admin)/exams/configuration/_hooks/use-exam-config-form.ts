import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AdminExamConfigSchema } from '@sentinel/shared/schema';
import { AdminExamConfigTypes } from '@sentinel/shared/types';

export function useExamConfigForm({ defaultValues }: AdminExamConfigTypes.UseExamConfigFormProps) {
    const form = useForm<AdminExamConfigSchema.ExamConfigFormValues>({
        resolver: zodResolver(AdminExamConfigSchema.examConfigFormSchema),
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

    const onSubmit: SubmitHandler<AdminExamConfigSchema.ExamConfigFormValues> = (values) => {
        console.log(values);
        toast.success('Global exam policy updated successfully.');
    };

    return {
        form,
        onSubmit,
    };
}
