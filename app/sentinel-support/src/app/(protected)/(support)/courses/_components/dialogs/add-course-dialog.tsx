'use client';

import { useDepartmentsQuery } from '@sentinel/hooks';
import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { useAddCourseForm } from '../../_hooks/use-add-course-form';

interface AddCourseDialogProps {
    institutionId: string;
}

export function AddCourseDialog({ institutionId }: AddCourseDialogProps) {
    const [open, setOpen] = useState(false);
    const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery(
        '',
        institutionId || undefined,
    );
    const { form, onSubmit, isPending } = useAddCourseForm(institutionId, () => setOpen(false));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button disabled={!institutionId}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Course</DialogTitle>
                    <DialogDescription>
                        Create a new academic program or course for the selected institution.
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
                                                departments.map((department) => (
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
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
