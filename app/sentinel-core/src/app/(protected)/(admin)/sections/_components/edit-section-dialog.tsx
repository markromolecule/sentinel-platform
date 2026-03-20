"use client";

import { useEditSectionForm } from "@/app/(protected)/(admin)/sections/_hooks/use-edit-section-form";
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
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";
import { Section } from "@sentinel/shared/types";

interface EditSectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sectionToEdit: Section | null;
}

export function EditSectionDialog({ open, onOpenChange, sectionToEdit }: EditSectionDialogProps) {
    const { form, onSubmit, isPending } = useEditSectionForm(sectionToEdit || {} as Section, () => onOpenChange(false));
    const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery();
    const { data: courses = [], isLoading: isLoadingCourses } = useCoursesQuery();

    const selectedDepartmentId = form.watch("department_id");
    const filteredCourses = selectedDepartmentId
        ? courses.filter((course) => course.department === selectedDepartmentId)
        : courses;

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
                                        disabled={isLoadingDepartments || isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select Dept"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.code || dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                        disabled={isLoadingCourses || isPending || !selectedDepartmentId}
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
