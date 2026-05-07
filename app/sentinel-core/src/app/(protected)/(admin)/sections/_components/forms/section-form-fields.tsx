'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import type { UseFormReturn } from 'react-hook-form';
import type { 
    Department, 
    Course, 
    InstitutionNamingConventions 
} from '@sentinel/shared/types';
import { type SectionFormValues } from '@sentinel/shared/schema';
import { useEffect } from 'react';

export type SectionFormFieldsProps = {
    form: UseFormReturn<SectionFormValues>;
    departments?: Department[];
    courses?: Course[];
    namingConvention?: InstitutionNamingConventions | null;
    isPending?: boolean;
    mode?: 'create' | 'edit';
    fixedCourseId?: string;
};

export function SectionFormFields({
    form,
    departments = [],
    courses = [],
    namingConvention,
    isPending = false,
    mode = 'create',
    fixedCourseId,
}: SectionFormFieldsProps) {
    const courseId = form.watch('course_id');
    // Auto-prefill section name based on course-scoped naming conventions
    useEffect(() => {
        if (mode === 'edit') return;
        
        const effectiveCourseId = fixedCourseId || courseId;
        if (!namingConvention || !effectiveCourseId) return;

        const rule = namingConvention.namingRules.sectionRulesByCourseId[effectiveCourseId];
        const suggestedName = rule?.preview?.trim() || rule?.format?.trim() || '';

        if (suggestedName) {
            const currentName = form.getValues('name');
            if (!currentName) {
                form.setValue('name', suggestedName, { shouldValidate: true });
            }
        }
    }, [courseId, fixedCourseId, namingConvention, mode, form]);

    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                            disabled={isPending}
                            onValueChange={field.onChange}
                            value={field.value ?? ''}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {!fixedCourseId && (
                <FormField
                    control={form.control}
                    name="course_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course</FormLabel>
                            <Select
                                disabled={isPending}
                                onValueChange={field.onChange}
                                value={field.value ?? ''}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Section Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={isPending}
                                    placeholder="e.g., BSIT-1A"
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
                                disabled={isPending}
                                onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                value={field.value ? String(field.value) : ''}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
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
            </div>
        </div>
    );
}
