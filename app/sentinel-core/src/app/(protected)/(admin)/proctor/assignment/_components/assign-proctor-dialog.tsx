'use client';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { AssignInstructorDialogProps } from '@sentinel/shared/types';
import { assignmentFormSchema, AssignmentFormValues } from '@sentinel/shared/schema';
import { MOCK_PROCTOR_OPTIONS, MOCK_EXAM_OPTIONS } from '@sentinel/shared/mock-data';

export function AssignProctorDialog({
    assignment,
    open,
    onOpenChange,
}: AssignInstructorDialogProps) {
    const isEditing = !!assignment;

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentFormSchema),
        defaultValues: {
            instructorId: '',
            examId: '',
            notes: '',
        },
    });

    useEffect(() => {
        if (assignment) {
            form.reset({
                instructorId: assignment.instructorId,
                examId: assignment.examId,
                notes: assignment.notes,
            });
        } else {
            form.reset({
                instructorId: '',
                examId: '',
                notes: '',
            });
        }
    }, [assignment, form, open]);

    function onSubmit(values: AssignmentFormValues) {
        console.log('Submitting assignment:', values);

        // Find names for toast message
        const instructor = MOCK_PROCTOR_OPTIONS.find((p) => p.id === values.instructorId);
        const exam = MOCK_EXAM_OPTIONS.find((e) => e.id === values.examId);

        if (isEditing) {
            toast.success(`Assignment updated for ${instructor?.name || 'Instructor'}`);
        } else {
            toast.success(
                `${instructor?.name || 'Instructor'} assigned to ${exam?.name || 'Exam'} successfully`,
            );
        }

        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[500px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Assignment' : 'Assign Instructor'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modify the existing instructor assignment details.'
                            : 'Allocate an instructor to oversee a specific exam session.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="instructorId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Instructor</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an instructor" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {MOCK_PROCTOR_OPTIONS.map((instructor) => (
                                                <SelectItem
                                                    key={instructor.id}
                                                    value={instructor.id}
                                                >
                                                    {instructor.name}
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
                            name="examId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Exam</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an exam" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {MOCK_EXAM_OPTIONS.map((exam) => (
                                                <SelectItem key={exam.id} value={exam.id}>
                                                    {exam.name}
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
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Add specific instructions..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">
                                {isEditing ? 'Update Assignment' : 'Create Assignment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
