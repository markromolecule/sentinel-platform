'use client';

import { useDepartmentsQuery } from '@sentinel/hooks';
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
import { useEditCourseForm } from '@/app/(protected)/(superadmin)/courses/_hooks/use-edit-course-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { Course } from '@sentinel/shared/types';

interface EditCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseToEdit: Course;
}

export function EditCourseDialog({ open, onOpenChange, courseToEdit }: EditCourseDialogProps) {
    const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery();
    const { form, onSubmit, isPending } = useEditCourseForm(courseToEdit, () =>
        onOpenChange(false),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[500px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>
                        Modify the details of the academic program or course.
                    </DialogDescription>
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
                                        value={field.value || ''}
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
                                                departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
