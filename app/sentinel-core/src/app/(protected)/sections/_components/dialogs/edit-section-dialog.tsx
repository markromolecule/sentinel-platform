'use client';

import { useCoursesQuery, useDepartmentsQuery, useStableValue } from '@sentinel/hooks';
import { useEditSectionForm } from '@/app/(protected)/sections/_hooks/use-edit-section-form';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { Form } from '@sentinel/ui';
import { Section } from '@sentinel/shared/types';
import { useEffect } from 'react';
import { isParentOwnedRecord } from '@/components/common/inheritance-status-badge';

interface EditSectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sectionToEdit: Section | null;
}

import { SectionFormFields } from '../forms/section-form-fields';

export function EditSectionDialog({ open, onOpenChange, sectionToEdit }: EditSectionDialogProps) {
    const { form, onSubmit, isPending } = useEditSectionForm((sectionToEdit || {}) as Section, () =>
        onOpenChange(false),
    );
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

    if (!sectionToEdit) return null;

    const isInheritedSection = isParentOwnedRecord(sectionToEdit);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[425px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Edit Section</DialogTitle>
                    <DialogDescription>
                        {isInheritedSection
                            ? `This will create a local copy for your branch only. The parent value for "${sectionToEdit.name}" will remain unchanged for other branches.`
                            : `Update details for section "${sectionToEdit.name}".`}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <SectionFormFields
                            form={form}
                            departments={availableDepartments}
                            courses={filteredCourses}
                            isPending={isPending || isLoadingDepartments || isLoadingCourses}
                            mode="edit"
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
