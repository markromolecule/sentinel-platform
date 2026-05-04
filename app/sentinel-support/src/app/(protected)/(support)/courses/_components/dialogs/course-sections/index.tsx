'use client';

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { CourseSectionsTable } from './course-sections-table';
import { CourseSectionsForm } from './course-sections-form';
import { useCourseSectionsDialog } from './_hooks/use-course-sections-dialog';
import { type CourseSectionsDialogProps } from './_types';

export function CourseSectionsDialog({
    open,
    onOpenChange,
    courseId,
    courseTitle,
    institutionId,
}: CourseSectionsDialogProps) {
    const {
        sections,
        isLoading,
        form,
        fields,
        append,
        remove,
        createSectionsMutation,
        onSubmit,
        handleClose,
        handleDelete,
    } = useCourseSectionsDialog({
        courseId,
        institutionId,
        open,
        onOpenChange,
    });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Manage Sections — {courseTitle}</DialogTitle>
                    <DialogDescription>
                        View existing sections and add new ones for this course program.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto py-4">
                    <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-5">
                        <div className="lg:col-span-3">
                            <CourseSectionsTable
                                sections={sections}
                                isLoading={isLoading}
                                onDelete={handleDelete}
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <CourseSectionsForm
                                form={form}
                                fields={fields}
                                append={append}
                                remove={remove}
                                isPending={createSectionsMutation.isPending}
                                onSubmit={onSubmit}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={handleClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
