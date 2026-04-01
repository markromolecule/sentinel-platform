"use client";

import { useInstitutionsQuery } from "@sentinel/hooks";
import { Institution } from "@sentinel/shared/types";
import { UseFormReturn } from "react-hook-form";
import { SemesterFormValues } from "@sentinel/shared/schema";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { Checkbox } from "@sentinel/ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@sentinel/ui";
import { ACADEMIC_YEAR_OPTIONS, SEMESTER_OPTIONS } from "./constants";

interface SemesterFormFieldsProps {
    form: UseFormReturn<SemesterFormValues>;
    isPending: boolean;
}

export function SemesterFormFields({ form, isPending }: SemesterFormFieldsProps) {
    const { data: institutions = [] } = useInstitutionsQuery();

    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="institution_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Institution</FormLabel>
                        <Select
                            disabled={isPending}
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
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
            <FormField
                control={form.control}
                name="academic_year"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <Select
                            disabled={isPending}
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select academic year" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {ACADEMIC_YEAR_OPTIONS.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
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
                name="semester"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <Select
                            disabled={isPending}
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {SEMESTER_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    disabled={isPending}
                                    {...field}
                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value ?? '')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    disabled={isPending}
                                    {...field}
                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value ?? '')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isPending}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                                Set as Active Semester
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                                Activating this will automatically deactivate all other semesters.
                            </p>
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
}
