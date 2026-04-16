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
import { usePathname } from 'next/navigation';
import React from 'react';

interface RoleFieldProps {
    form: UseFormReturn<UserFormValues>;
    watchedRole: string;
    isAdministratorForm: boolean;
}

export function RoleField({ form, watchedRole, isAdministratorForm }: RoleFieldProps) {
    const pathname = usePathname();
    const isFixedRole = pathname.includes('/students') || pathname.includes('/instructors');

    return (
        <FormField
            control={form.control}
            name="role"
            render={({ field }) =>
                isAdministratorForm ? (
                    <input type="hidden" {...field} value={field.value ?? 'admin'} />
                ) : (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                            disabled={isFixedRole}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                {watchedRole === 'admin' && (
                                    <SelectItem value="admin">Administrator</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )
            }
        />
    );
}
