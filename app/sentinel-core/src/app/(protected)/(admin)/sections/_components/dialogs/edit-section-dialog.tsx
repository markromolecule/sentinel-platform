"use client";

import { useCoursesQuery, useDepartmentsQuery } from "@sentinel/hooks";
import { useEditSectionForm } from "@/app/(protected)/(admin)/sections/_hooks/use-edit-section-form";
import { useAcademicScope } from "@/hooks/use-academic-scope";
import { Button } from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@sentinel/ui";
import { Section } from "@sentinel/shared/types";
import { useEffect, useMemo } from "react";

interface EditSectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sectionToEdit: Section | null;
}

export function EditSectionDialog({ open, onOpenChange, sectionToEdit }: EditSectionDialogProps) {
    const { form, onSubmit, isPending } = useEditSectionForm(sectionToEdit || {} as Section, () => onOpenChange(false));
    const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery();
    const { data: courses = [], isLoading: isLoadingCourses } = useCoursesQuery();
    const {
        assignedDepartmentId,
        assignedCourseId,
        shouldLockDepartment,
        shouldLockCourse,
    } = useAcademicScope();

    const selectedDepartmentId = form.watch("department_id");
    const availableDepartments = useMemo(
        () =>
            shouldLockDepartment && assignedDepartmentId
                ? departments.filter((department) => department.id === assignedDepartmentId)
                : departments,
        [assignedDepartmentId, departments, shouldLockDepartment],
    );
    const filteredCourses = useMemo(() => {
        const departmentFiltered = selectedDepartmentId
            ? courses.filter((course) => course.department === selectedDepartmentId)
            : courses;

        return shouldLockCourse && assignedCourseId
            ? departmentFiltered.filter((course) => course.id === assignedCourseId)
            : departmentFiltered;
    }, [assignedCourseId, courses, selectedDepartmentId, shouldLockCourse]);

    useEffect(() => {
        if (shouldLockDepartment && assignedDepartmentId && form.getValues("department_id") !== assignedDepartmentId) {
            form.setValue("department_id", assignedDepartmentId, {
                shouldDirty: false,
                shouldValidate: true,
            });
        }

        if (shouldLockCourse && assignedCourseId && form.getValues("course_id") !== assignedCourseId) {
            form.setValue("course_id", assignedCourseId, {
                shouldDirty: false,
                shouldValidate: true,
            });
        }
    }, [assignedCourseId, assignedDepartmentId, form, shouldLockCourse, shouldLockDepartment]);

    if (!sectionToEdit) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[425px] data-[state=open]:animate-none data-[state=closed]:animate-none"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Edit Section</DialogTitle>
                    <DialogDescription>
                        Update details for section &quot;{sectionToEdit.name}&quot;.
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
                                            value={field.value || undefined}
                                            disabled={isLoadingDepartments || isPending || (shouldLockDepartment && Boolean(assignedDepartmentId))}
                                        >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select Dept"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableDepartments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.code || dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {shouldLockDepartment && assignedDepartmentId && (
                                        <p className="text-[0.8rem] text-muted-foreground">
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
                                            value={field.value || undefined}
                                            disabled={isLoadingCourses || isPending || !selectedDepartmentId || (shouldLockCourse && Boolean(assignedCourseId))}
                                        >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={isLoadingCourses ? "Loading..." : "Select Course"} />
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
                                        <p className="text-[0.8rem] text-muted-foreground">
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
                                        <Input disabled={isPending} placeholder="e.g., BSIT-1A or INF231" {...field} />
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
                                    <FormLabel>Year Level (Optional)</FormLabel>
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
                            <Button disabled={isPending} type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
