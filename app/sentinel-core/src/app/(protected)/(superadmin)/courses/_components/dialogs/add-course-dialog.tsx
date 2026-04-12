'use client';

import { useActivePermissions, useDepartmentsQuery, useStableValue } from '@sentinel/hooks';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
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
import { useAddCourseForm } from '@/app/(protected)/(superadmin)/courses/_hooks/use-add-course-form';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';

export function AddCourseDialog() {
    const { hasPermission } = useActivePermissions();
    const [open, setOpen] = useState(false);
    const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery();
    const { form, onSubmit, isPending } = useAddCourseForm(() => setOpen(false));
    const { assignedDepartmentId, shouldLockDepartment } = useAcademicScope();
    const availableDepartments = useStableValue(
        () =>
            shouldLockDepartment && assignedDepartmentId
                ? departments.filter((department) => department.id === assignedDepartmentId)
                : departments,
        [assignedDepartmentId, departments, shouldLockDepartment],
    );

    useEffect(() => {
        if (
            shouldLockDepartment &&
            assignedDepartmentId &&
            form.getValues('department_id') !== assignedDepartmentId
        ) {
            form.setValue('department_id', assignedDepartmentId, {
                shouldDirty: false,
                shouldValidate: true,
            });
        }
    }, [assignedDepartmentId, form, shouldLockDepartment]);

    if (!hasPermission('courses:create')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </DialogTrigger>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[500px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Add Course</DialogTitle>
                    <DialogDescription>Create a new academic program or course.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., BSIT-MWA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descriptive Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Bachelor of Science in Information Technology..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="department_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || ''}
                                        value={field.value || ''}
                                        disabled={
                                            shouldLockDepartment && Boolean(assignedDepartmentId)
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingDepartments ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading departments...
                                                </SelectItem>
                                            ) : (
                                                availableDepartments.map((department) => (
                                                    <SelectItem
                                                        key={department.id}
                                                        value={department.id}
                                                    >
                                                        {department.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {shouldLockDepartment && assignedDepartmentId && (
                                        <p className="text-muted-foreground text-[0.8rem]">
                                            Department is locked to your assigned scope.
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Creating...' : 'Create Course'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
