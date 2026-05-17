'use client';

import {
    useActivePermissions,
    useCoursesQuery,
    useDepartmentsQuery,
    useStableValue,
} from '@sentinel/hooks';
import { useEffect, useState } from 'react';
import { useAddSectionForm } from '@/app/(protected)/sections/_hooks/use-add-section-form';
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
import { Form } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { useAcademicScope } from '@/hooks/use-academic-scope';

import { SectionFormFields } from '../forms/section-form-fields';
import { useEffectiveInstitutionNamingConventionsQuery } from '@sentinel/hooks';

export function AddSectionDialog() {
    const { hasPermission } = useActivePermissions();
    const [open, setOpen] = useState(false);
    const { form, onSubmit, isPending } = useAddSectionForm(() => setOpen(false));
    const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery();
    const { data: courses = [], isLoading: isLoadingCourses } = useCoursesQuery();
    const {
        assignedDepartmentId,
        assignedCourseId,
        shouldLockDepartment,
        shouldLockCourse,
        institutionId,
    } = useAcademicScope();

    const { data: namingConvention } = useEffectiveInstitutionNamingConventionsQuery(
        institutionId || '',
    );

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
            ? courses.filter((course) => course.departmentId === selectedDepartmentId)
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

    if (!hasPermission('sections:create')) {
        return null;
    }

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
                        <SectionFormFields
                            form={form}
                            departments={availableDepartments}
                            courses={filteredCourses}
                            namingConvention={namingConvention}
                            isPending={isPending || isLoadingDepartments || isLoadingCourses}
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
