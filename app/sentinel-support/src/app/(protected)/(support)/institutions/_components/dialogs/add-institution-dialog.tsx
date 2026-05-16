'use client';

import {
    useActivePermissions,
    useCreateInstitutionMutation,
    useInstitutionsQuery,
} from '@sentinel/hooks';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@sentinel/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { NativeSelect, NativeSelectOption } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver } from 'react-hook-form';
import { institutionSchema, InstitutionFormValues } from '@sentinel/shared/schema';
import { Institution } from '@sentinel/shared/types';

type AddInstitutionDialogProps = {
    parentInstitution?: Institution | null;
};

export function AddInstitutionDialog({ parentInstitution = null }: AddInstitutionDialogProps) {
    const { hasPermission } = useActivePermissions();
    const [open, setOpen] = useState(false);
    const { data: institutions = [] } = useInstitutionsQuery({
        search: '',
    });
    const parentOptions = institutions.filter(
        (institution) => institution.institutionKind !== 'CHILD',
    );
    const createMutation = useCreateInstitutionMutation({
        onSuccess: () => {
            toast.success('Institution added successfully');
            form.reset();
            setOpen(false);
        },
    });

    const form = useForm<InstitutionFormValues>({
        resolver: zodResolver(institutionSchema) as unknown as Resolver<InstitutionFormValues>,
        defaultValues: {
            name: '',
            code: '',
            institutionKind: parentInstitution ? 'CHILD' : 'STANDALONE',
            parentInstitutionId: parentInstitution?.id ?? '',
        },
    });

    const selectedKind = useWatch({
        control: form.control,
        name: 'institutionKind',
    });

    const onSubmit = (data: InstitutionFormValues) => {
        createMutation.mutate(data);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            form.reset({
                name: '',
                code: '',
                institutionKind: parentInstitution ? 'CHILD' : 'STANDALONE',
                parentInstitutionId: parentInstitution?.id ?? '',
            });
        }
    };

    if (!hasPermission('institutions:create')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-white text-slate-900 hover:bg-slate-50 border border-slate-200">
                    <Plus className="mr-2 h-4 w-4" />
                    {parentInstitution ? 'Add Branch' : 'Add Institution'}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[425px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium text-foreground">
                        {parentInstitution ? 'Add Branch' : 'Add Institution'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {parentInstitution
                            ? `Create a new branch under ${parentInstitution.name}.`
                            : 'Create a new institution.'}
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
                                        <Input
                                            placeholder="National University - Manila"
                                            {...field}
                                        />
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
                                        <Input placeholder="e.g., NUM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {parentInstitution ? (
                            <FormField
                                control={form.control}
                                name="parentInstitutionId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Institution</FormLabel>
                                        <FormControl>
                                            <Input value={parentInstitution.name} disabled />
                                        </FormControl>
                                        <input
                                            type="hidden"
                                            {...field}
                                            value={parentInstitution.id}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <>
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
                                                            form.setValue(
                                                                'parentInstitutionId',
                                                                '',
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <NativeSelectOption value="STANDALONE">
                                                        Standalone
                                                    </NativeSelectOption>
                                                    <NativeSelectOption value="PARENT">
                                                        Parent
                                                    </NativeSelectOption>
                                                    <NativeSelectOption value="CHILD">
                                                        Branch
                                                    </NativeSelectOption>
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
                                                    <NativeSelect
                                                        {...field}
                                                        value={field.value || ''}
                                                    >
                                                        <NativeSelectOption value="">
                                                            Select parent
                                                        </NativeSelectOption>
                                                        {parentOptions.map((institution) => (
                                                            <NativeSelectOption
                                                                key={institution.id}
                                                                value={institution.id}
                                                            >
                                                                {institution.name}
                                                            </NativeSelectOption>
                                                        ))}
                                                    </NativeSelect>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </>
                        )}
                        <DialogFooter>
                            <Button
                                type="submit"
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? 'Creating...' : 'Create Institution'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
