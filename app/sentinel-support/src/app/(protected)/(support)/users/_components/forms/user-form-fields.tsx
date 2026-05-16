'use client';

import { useDepartmentsQuery, useInstitutionsQuery } from '@sentinel/hooks';
import { Department, Institution } from '@sentinel/shared/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '@sentinel/shared/schema';
import type { AdministratorRole } from '@/app/(protected)/(support)/users/_lib/administrator-role-config';
import { getAdministratorRoleConfig } from '@/app/(protected)/(support)/users/_lib/administrator-role-config';

interface UserFormFieldsProps {
    form: UseFormReturn<UserFormValues>;
    role: AdministratorRole;
}

export function UserFormFields({ form, role }: UserFormFieldsProps) {
    const watchedInstitution = form.watch('institution');
    const watchedDepartment = form.watch('department');
    const config = getAdministratorRoleConfig(role);

    const { data: institutions = [] } = useInstitutionsQuery();
    const { data: departments = [], isFetched: hasFetchedDepartments } = useDepartmentsQuery({
        institutionId: watchedInstitution || undefined,
    });

    useEffect(() => {
        if (!watchedDepartment || !watchedInstitution || !hasFetchedDepartments) {
            return;
        }

        const departmentExists = departments.some(
            (department: Department) => department.id === watchedDepartment,
        );

        if (!departmentExists) {
            form.setValue('department', '');
        }
    }, [departments, watchedDepartment, watchedInstitution, hasFetchedDepartments, form]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="name@sentinelph.tech" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    if (value !== watchedInstitution) {
                                        form.setValue('department', '');
                                    }
                                }}
                                value={field.value ?? ''}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select institution" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {institutions.map((institution: Institution) => (
                                        <SelectItem key={institution.id} value={institution.id}>
                                            {institution.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {config.requiresDepartment ? (
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select
                                    disabled={!watchedInstitution}
                                    onValueChange={field.onChange}
                                    value={field.value ?? ''}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    watchedInstitution
                                                        ? 'Select department'
                                                        : 'Select institution first'
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departments.map((department: Department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                {department.code?.trim() || department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : null}
            </div>

            <div className="border-border/60 bg-muted/30 text-muted-foreground rounded-md border px-4 py-3 text-sm">
                {config.formFootnote}
            </div>
        </div>
    );
}
