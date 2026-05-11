'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import type { UseFormReturn } from 'react-hook-form';
import type { Institution, InstitutionNamingConventions } from '@sentinel/shared/types';
import { type RoomFormValues } from '@sentinel/shared/schema';
import { useEffect } from 'react';

export type RoomFormFieldsProps = {
    form: UseFormReturn<RoomFormValues>;
    institutions?: Institution[];
    namingConvention?: InstitutionNamingConventions | null;
    isPending?: boolean;
    mode?: 'create' | 'edit';
    showInstitutionSelect?: boolean;
};

export function RoomFormFields({
    form,
    institutions = [],
    namingConvention,
    isPending = false,
    mode = 'create',
    showInstitutionSelect = true,
}: RoomFormFieldsProps) {
    const roomNumber = form.watch('room_number');
    const roomType = form.watch('room_type');

    // Auto-prefill name and code based on naming conventions
    useEffect(() => {
        if (mode === 'edit') return;
        if (!namingConvention) return;

        const rules = namingConvention.namingRules.room;
        const number = roomNumber?.trim() || '';

        if (number) {
            const label = rules.label || 'Room';
            const prefix = roomType === 'VIRTUAL' ? rules.virtualPrefix : rules.prefix;

            // Only prefill if user hasn't manually edited them or they are still the default values
            const currentName = form.getValues('name');
            const currentCode = form.getValues('code');

            // Simple heuristic: if name is empty or just the label, or matches the formula, update it
            if (!currentName || currentName === label || currentName === `${label} ${number}`) {
                form.setValue('name', `${label} ${number}`.trim(), { shouldValidate: true });
            }

            if (!currentCode || currentCode === prefix || currentCode === `${prefix}${number}`) {
                form.setValue('code', `${prefix}${number}`.trim(), { shouldValidate: true });
            }
        }
    }, [roomNumber, roomType, namingConvention, mode, form]);

    return (
        <div className="space-y-4">
            {showInstitutionSelect && (
                <FormField
                    control={form.control}
                    name="institution_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <Select
                                disabled={isPending || mode === 'edit'}
                                onValueChange={field.onChange}
                                value={field.value ?? ''}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select institution" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {institutions.map((institution) => (
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
            )}

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="room_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Number / ID</FormLabel>
                            <FormControl>
                                <Input disabled={isPending} placeholder="e.g., 101" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="room_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Room Type</FormLabel>
                            <Select
                                disabled={isPending}
                                onValueChange={field.onChange}
                                value={field.value ?? 'LECTURE'}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="LECTURE">Lecture Room</SelectItem>
                                    <SelectItem value="LABORATORY">Laboratory Room</SelectItem>
                                    <SelectItem value="VIRTUAL">Virtual Room</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                            <Input disabled={isPending} placeholder="Room 101" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>System Code</FormLabel>
                        <FormControl>
                            <Input
                                disabled={isPending}
                                placeholder="RM101"
                                {...field}
                                value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
