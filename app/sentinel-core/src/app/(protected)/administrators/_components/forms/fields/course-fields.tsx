'use client';

import {
    Checkbox,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '@sentinel/shared/schema';
import { Course } from '@sentinel/shared/types';

interface CourseFieldProps {
    form: UseFormReturn<UserFormValues>;
    filteredCourseOptions: Course[];
    watchedDepartment: string;
    shouldLockCourse: boolean;
    isAdmin: boolean;
}

export function CourseField({
    form,
    filteredCourseOptions,
    watchedDepartment,
    shouldLockCourse,
    isAdmin,
}: CourseFieldProps) {
    return (
        <FormField
            control={form.control}
            name="course"
            render={({ field }) => (
                <FormItem className="min-w-0">
                    <FormLabel>{isAdmin ? 'Assigned Course' : 'Course'}</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={!watchedDepartment || shouldLockCourse}
                    >
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={
                                        watchedDepartment
                                            ? 'Select course'
                                            : 'Select department first'
                                    }
                                />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {filteredCourseOptions.map((course: Course) => (
                                <SelectItem key={course.id} value={course.id}>
                                    {[course.code?.trim(), course.title?.trim()]
                                        .filter(Boolean)
                                        .join(' - ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {shouldLockCourse && (
                        <p className="text-muted-foreground text-[0.8rem]">
                            Course is locked to your assigned scope.
                        </p>
                    )}
                    {isAdmin && (
                        <p className="text-muted-foreground text-[0.8rem]">
                            Administrators can only be assigned to one course.
                        </p>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

interface MultiCourseFieldProps {
    form: UseFormReturn<UserFormValues>;
    filteredCourseOptions: Course[];
    watchedDepartment: string;
    shouldLockCourse: boolean;
}

export function MultiCourseField({
    form,
    filteredCourseOptions,
    watchedDepartment,
    shouldLockCourse,
}: MultiCourseFieldProps) {
    return (
        <FormField
            control={form.control}
            name="courseIds"
            render={({ field }) => {
                const selectedCourseIds = field.value ?? [];

                return (
                    <FormItem className="min-w-0">
                        <FormLabel>Assigned Courses</FormLabel>
                        <div className="max-h-52 space-y-2 overflow-y-auto rounded-md border p-3">
                            {watchedDepartment ? (
                                filteredCourseOptions.length > 0 ? (
                                    filteredCourseOptions.map((course: Course) => {
                                        const isChecked = selectedCourseIds.includes(course.id);

                                        return (
                                            <label
                                                key={course.id}
                                                className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-md px-2 py-1"
                                            >
                                                <Checkbox
                                                    checked={isChecked}
                                                    disabled={shouldLockCourse}
                                                    onCheckedChange={(checked) => {
                                                        const nextValues = checked
                                                            ? [...selectedCourseIds, course.id]
                                                            : selectedCourseIds.filter(
                                                                  (value) => value !== course.id,
                                                              );

                                                        field.onChange(
                                                            Array.from(new Set(nextValues)),
                                                        );
                                                    }}
                                                />
                                                <span className="text-sm leading-5">
                                                    {[course.code?.trim(), course.title?.trim()]
                                                        .filter(Boolean)
                                                        .join(' - ')}
                                                </span>
                                            </label>
                                        );
                                    })
                                ) : (
                                    <p className="text-muted-foreground text-sm">
                                        No courses are available for the selected department.
                                    </p>
                                )
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    Select a department first to assign courses.
                                </p>
                            )}
                        </div>
                        <p className="text-muted-foreground text-[0.8rem]">
                            {shouldLockCourse
                                ? 'Assigned course is locked to your scope.'
                                : 'Instructors can be assigned to multiple courses.'}
                        </p>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
