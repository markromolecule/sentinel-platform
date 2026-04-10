'use client';

import { useCoursesQuery, useDepartmentsQuery, useStableValue } from '@sentinel/hooks';
import { useEffect, useState } from 'react';
import { useAddSectionForm } from '@/app/(protected)/(admin)/sections/_hooks/use-add-section-form';
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
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { useAcademicScope } from '@/hooks/use-academic-scope';

export function AddSectionDialog() {
    const [open, setOpen] = useState(false);
    const { form, onSubmit, isPending } = useAddSectionForm(() => setOpen(false));
    const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery();
    const { data: courses = [], isLoading: isLoadingCourses } = useCoursesQuery();
    const { assignedDepartmentId, assignedCourseId, shouldLockDepartment, shouldLockCourse } =
        useAcademicScope();

    const selectedDepartmentId = form.watch('department_id');
    const availableDepartments = useStableValue(
        () =>
            shouldLockDepartment && assignedDepartmentId
                ? departments.filter((department) => department.id === assignedDepartmentId)
                : departments,
        [assignedDepartmentId, departments, shouldLockDepartment],
    );
    const filteredCourses = useStableValue(() => {
        const departmentFiltered = selectedDepartmentId
            ? courses.filter((course) => course.department === selectedDepartmentId)
            : courses;

        return shouldLockCourse && assignedCourseId
            ? departmentFiltered.filter((course) => course.id === assignedCourseId)
            : departmentFiltered;
    }, [assignedCourseId, courses, selectedDepartmentId, shouldLockCourse]);

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

        if (
            shouldLockCourse &&
            assignedCourseId &&
            form.getValues('course_id') !== assignedCourseId
        ) {
            form.setValue('course_id', assignedCourseId, {
                shouldDirty: false,
                shouldValidate: true,
            });
        }
    }, [assignedCourseId, assignedDepartmentId, form, shouldLockCourse, shouldLockDepartment]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Section
                </Button>
            </DialogTrigger>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[425px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Add Section</DialogTitle>
                    <DialogDescription>
                        Create a new section under a specific department.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            isLoadingDepartments ||
                                            isPending ||
                                            (shouldLockDepartment && Boolean(assignedDepartmentId))
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingDepartments
                                                            ? 'Loading...'
                                                            : 'Select Dept'
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableDepartments.map((department) => (
                                                <SelectItem
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.code || department.name}
                                                </SelectItem>
                                            ))}
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
                        <FormField
                            control={form.control}
                            name="course_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || ''}
                                        value={field.value || ''}
                                        disabled={
                                            isLoadingCourses ||
                                            isPending ||
                                            !selectedDepartmentId ||
                                            (shouldLockCourse && Boolean(assignedCourseId))
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingCourses
                                                            ? 'Loading...'
                                                            : 'Select Course'
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {filteredCourses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.code || course.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {shouldLockCourse && assignedCourseId && (
                                        <p className="text-muted-foreground text-[0.8rem]">
                                            Course is locked to your assigned scope.
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Section Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending}
                                            placeholder="e.g., BSIT-1A or INF231"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="year_level"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Year Level</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ? String(field.value) : undefined}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((year) => (
                                                <SelectItem key={year} value={String(year)}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                {isPending ? 'Adding...' : 'Add Section'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
