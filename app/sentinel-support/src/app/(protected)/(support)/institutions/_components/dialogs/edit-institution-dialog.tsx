'use client';

import { useEffect } from 'react';
import { useUpdateInstitutionMutation } from '@sentinel/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { institutionSchema, InstitutionFormValues } from '@sentinel/shared/schema';
import { toast } from 'sonner';
import { Institution } from '@sentinel/shared/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Button,
    Input,
} from '@sentinel/ui';

interface EditInstitutionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    institutionToEdit: Institution;
}

export function EditInstitutionDialog({
    open,
    onOpenChange,
    institutionToEdit,
}: EditInstitutionDialogProps) {
    const updateMutation = useUpdateInstitutionMutation({
        onSuccess: () => {
            toast.success('Institution updated successfully');
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update institution');
        },
    });

    const form = useForm<InstitutionFormValues>({
        resolver: zodResolver(institutionSchema),
        defaultValues: {
            name: institutionToEdit.name,
            code: institutionToEdit.code || '',
        },
    });

    useEffect(() => {
        form.reset({
            name: institutionToEdit.name,
            code: institutionToEdit.code || '',
        });
    }, [form, institutionToEdit]);

    const onSubmit = (data: InstitutionFormValues) => {
        updateMutation.mutate({
            id: institutionToEdit.id,
            payload: data,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Institution</DialogTitle>
                    <DialogDescription>
                        Update details for {institutionToEdit.name}.
                    </DialogDescription>
                </DialogHeader>
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
                        <DialogFooter>
                            <Button
                                type="submit"
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
