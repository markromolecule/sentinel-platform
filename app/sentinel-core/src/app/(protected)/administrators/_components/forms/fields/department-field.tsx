'use client';

import {
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
import { Department } from '@sentinel/shared/types';

interface DepartmentFieldProps {
    form: UseFormReturn<UserFormValues>;
    availableDepartments: Department[] | undefined;
    shouldLockDepartment: boolean;
    isAdmin: boolean;
    shouldLockCourse: boolean;
}

export function DepartmentField({
    form,
    availableDepartments,
    shouldLockDepartment,
    isAdmin,
    shouldLockCourse,
}: DepartmentFieldProps) {
    return (
        <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
                <FormItem className="min-w-0">
                    <FormLabel>Department</FormLabel>
                    <Select
                        onValueChange={(val) => {
                            field.onChange(val);
                            if (!shouldLockCourse) {
                                form.setValue('course', '');
                                form.setValue('courseIds', []);
                            }
                        }}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={shouldLockDepartment}
                    >
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {availableDepartments?.map((dept: Department) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.code?.trim() || dept.name?.trim()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {shouldLockDepartment && (
                        <p className="text-muted-foreground text-[0.8rem]">
                            Department is locked to your assigned scope.
                        </p>
                    )}
                    {isAdmin && (
                        <p className="text-muted-foreground text-[0.8rem]">
                            Select the department before assigning the course.
                        </p>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
