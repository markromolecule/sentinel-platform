'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '@sentinel/shared/schema';
import { Institution } from '@sentinel/shared/types';

interface InstitutionFieldProps {
    form: UseFormReturn<UserFormValues>;
    institutions: Institution[] | undefined;
    isSuperadmin: boolean;
    shouldLockInstitution: boolean;
    selectedInstitutionName: string;
}

export function InstitutionField({
    form,
    institutions,
    isSuperadmin,
    shouldLockInstitution,
    selectedInstitutionName,
}: InstitutionFieldProps) {
    return (
        <FormField
            control={form.control}
            name="institution"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Institution</FormLabel>
                    {isSuperadmin && !shouldLockInstitution ? (
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? ''}
                            value={field.value ?? ''}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select institution" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {institutions?.map((inst: Institution) => (
                                    <SelectItem key={inst.id} value={inst.id}>
                                        {inst.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <>
                            <FormControl>
                                <Input
                                    value={selectedInstitutionName}
                                    disabled
                                    readOnly
                                    className="bg-muted text-muted-foreground"
                                />
                            </FormControl>
                            <input type="hidden" {...field} value={field.value ?? ''} />
                        </>
                    )}
                    <p className="text-muted-foreground text-[0.8rem]">
                        {isSuperadmin && !shouldLockInstitution
                            ? 'Select the institution for this administrator.'
                            : 'Automatically assigned based on the current account.'}
                    </p>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
