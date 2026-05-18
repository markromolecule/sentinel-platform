'use client';

import { useEditDepartmentForm } from '@/app/(protected)/departments/_hooks/use-edit-department-form';
import { useInstitutionsQuery, useProfileQuery } from '@sentinel/hooks';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { Department, Institution } from '@sentinel/shared/types';

interface EditDepartmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    departmentToEdit: Department | null;
}

export function EditDepartmentDialog({
    open,
    onOpenChange,
    departmentToEdit,
}: EditDepartmentDialogProps) {
    const { form, onSubmit, isPending } = useEditDepartmentForm(
        departmentToEdit || ({} as Department),
        () => onOpenChange(false),
    );
    const { data: institutions = [] } = useInstitutionsQuery();
    const { profile } = useProfileQuery();

    const showInstitutionSelect = !profile?.institutionId;

    if (!departmentToEdit) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[425px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Edit Department</DialogTitle>
                    <DialogDescription>
                        Update details for department &quot;{departmentToEdit.name}&quot;.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {showInstitutionSelect && (
                            <FormField
                                control={form.control}
                                name="institution_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Institution</FormLabel>
                                        <Select
                                            disabled={isPending}
                                            onValueChange={field.onChange}
                                            value={field.value ?? ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select institution" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {institutions.map((institution: Institution) => (
                                                    <SelectItem
                                                        key={institution.id}
                                                        value={institution.id}
                                                    >
                                                        {institution.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending}
                                            placeholder="School of..."
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
                                    <FormLabel>Department Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending}
                                            placeholder="e.g., SASE"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                            >
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
