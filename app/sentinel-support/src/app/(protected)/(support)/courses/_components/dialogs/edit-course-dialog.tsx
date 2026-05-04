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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { useEditCourseForm } from '../../_hooks/use-edit-course-form';
import { Course } from '@sentinel/shared/types';

interface EditCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: Course;
    institutionId: string;
}

export function EditCourseDialog({
    open,
    onOpenChange,
    course,
    institutionId,
}: EditCourseDialogProps) {
    const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery(
        '',
        institutionId || undefined,
    );
    const { form, onSubmit, isPending } = useEditCourseForm(
        course,
        institutionId,
        () => onOpenChange(false),
    );

    const isInherited = course.isInherited;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>
                        {isInherited
                            ? 'This inherited course will become a local override for the selected branch context.'
                            : 'Modify the details of the academic program or course.'}
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
                                            <SelectItem value="">Unassigned</SelectItem>
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
