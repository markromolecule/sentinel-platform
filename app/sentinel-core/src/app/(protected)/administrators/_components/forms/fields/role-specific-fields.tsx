'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@sentinel/ui';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '@sentinel/shared/schema';

interface RoleSpecificFieldsProps {
    form: UseFormReturn<UserFormValues>;
    isStudent: boolean;
    isInstructor: boolean;
}

export function RoleSpecificFields({ form, isStudent, isInstructor }: RoleSpecificFieldsProps) {
    if (!isStudent && !isInstructor) return null;

    return (
        <div className={`grid gap-4 ${isStudent && isInstructor ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {isStudent && (
                <FormField
                    control={form.control}
                    name="studentNo"
                    render={({ field }) => (
                        <FormItem className="min-w-0">
                            <FormLabel>Student ID</FormLabel>
                            <FormControl>
                                <Input placeholder="2024-XXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            {isInstructor && (
                <FormField
                    control={form.control}
                    name="employeeNo"
                    render={({ field }) => (
                        <FormItem className="min-w-0">
                            <FormLabel>Employee ID</FormLabel>
                            <FormControl>
                                <Input placeholder="EMP-2024-XXX" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
}
