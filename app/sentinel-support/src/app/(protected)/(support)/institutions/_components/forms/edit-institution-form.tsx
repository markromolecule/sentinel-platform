'use client';

import { useEffect } from 'react';
import { useUpdateInstitutionMutation, useInstitutionsQuery } from '@sentinel/hooks';
import { useForm, useWatch, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { institutionSchema, InstitutionFormValues } from '@sentinel/shared/schema';
import { toast } from 'sonner';
import { Institution } from '@sentinel/shared/types';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Button,
    Input,
    NativeSelect,
    NativeSelectOption,
} from '@sentinel/ui';

interface EditInstitutionFormProps {
    institution: Institution;
    onSuccess?: () => void;
}

export function EditInstitutionForm({
    institution,
    onSuccess,
}: EditInstitutionFormProps) {
    const updateMutation = useUpdateInstitutionMutation({
        onSuccess: () => {
            toast.success('Institution updated successfully');
            onSuccess?.();
        },
    });

    const { data: institutions = [] } = useInstitutionsQuery('');
    const parentOptions = institutions.filter(
        (candidate) =>
            candidate.institutionKind !== 'CHILD' &&
            candidate.id !== institution.id &&
            candidate.parentInstitutionId !== institution.id,
    );

    const form = useForm<InstitutionFormValues>({
        resolver: zodResolver(institutionSchema) as unknown as Resolver<InstitutionFormValues>,
        defaultValues: {
            name: institution.name,
            code: institution.code || '',
            institutionKind: institution.institutionKind || 'STANDALONE',
            parentInstitutionId: institution.parentInstitutionId || '',
        },
    });

    const selectedKind = useWatch({
        control: form.control,
        name: 'institutionKind',
    });

    useEffect(() => {
        form.reset({
            name: institution.name,
            code: institution.code || '',
            institutionKind: institution.institutionKind || 'STANDALONE',
            parentInstitutionId: institution.parentInstitutionId || '',
        });
    }, [form, institution]);

    const onSubmit = (data: InstitutionFormValues) => {
        updateMutation.mutate({
            id: institution.id,
            payload: data,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institution Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institution Code</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="institutionKind"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institution Type</FormLabel>
                            <FormControl>
                                <NativeSelect
                                    {...field}
                                    value={field.value || 'STANDALONE'}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        if (e.target.value !== 'CHILD') {
                                            form.setValue('parentInstitutionId', '');
                                        }
                                    }}
                                >
                                    <NativeSelectOption value="STANDALONE">Standalone</NativeSelectOption>
                                    <NativeSelectOption value="PARENT">Parent</NativeSelectOption>
                                    <NativeSelectOption value="CHILD">Branch</NativeSelectOption>
                                </NativeSelect>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {selectedKind === 'CHILD' && (
                    <FormField
                        control={form.control}
                        name="parentInstitutionId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent Institution</FormLabel>
                                <FormControl>
                                    <NativeSelect {...field} value={field.value || ''}>
                                        <NativeSelectOption value="">Select parent</NativeSelectOption>
                                        {parentOptions.map((item) => (
                                            <NativeSelectOption key={item.id} value={item.id}>
                                                {item.name}
                                            </NativeSelectOption>
                                        ))}
                                    </NativeSelect>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <div className="pt-4 flex justify-end">
                    <Button
                        type="submit"
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
