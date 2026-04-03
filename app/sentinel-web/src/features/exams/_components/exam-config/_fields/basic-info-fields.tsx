"use client";

import { useEffect, useMemo } from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@sentinel/ui";
import type { ExamCreateFormValues } from "@sentinel/shared/schema";
import { useSubjectStore } from "@/stores/use-subject-store";
import { useFormContext, useWatch } from "react-hook-form";
import type { ExamFormFieldProps } from "./_types";

export function BasicInfoFields({ control }: ExamFormFieldProps) {
    const subjects = useSubjectStore((state) => state.subjects);
    const masterSubjects = useSubjectStore((state) => state.masterSubjects);
    const { setValue } = useFormContext<ExamCreateFormValues>();

    const subjectId = useWatch({
        control,
        name: "subjectId",
    });
    const section = useWatch({
        control,
        name: "section",
    });

    const selectedSubject = subjects.find(s => s.id === subjectId);
    const relatedMaster = selectedSubject ? masterSubjects.find(ms => ms.code === selectedSubject.code) : null;
    const availableSections = useMemo(() => relatedMaster?.sections || [], [relatedMaster]);

    useEffect(() => {
        if (section && !availableSections.includes(section)) {
            setValue("section", "", { shouldDirty: true, shouldValidate: true });
        }
    }, [availableSections, section, setValue]);

    return (
        <section className="space-y-3">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold tracking-tight text-[#323d8f]">Exam Details</h3>
                <p className="text-sm text-muted-foreground">
                    Title, subject, and section.
                </p>
            </div>

            <div className="grid gap-3">
                <FormField
                    control={control}
                    name="title"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-bold">Exam Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Data Structures Midterm"
                                    className="h-10 bg-secondary/5"
                                    {...fieldProps}
                                    value={value as string}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="description"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-bold">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Briefly describe the coverage and instructions."
                                    className="min-h-[66px] resize-none bg-secondary/5"
                                    {...fieldProps}
                                    value={value as string}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <FormField
                    control={control}
                    name="subjectId"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem className="min-w-0">
                            <FormLabel className="text-sm font-bold">Subject</FormLabel>
                            <Select onValueChange={fieldProps.onChange} value={(value as string) || undefined}>
                                <FormControl>
                                    <SelectTrigger className="w-full h-10 bg-secondary/5 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left overflow-hidden min-w-0">
                                        <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id} className="pr-8 truncate">
                                            {subject.title} ({subject.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="section"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem className="min-w-0">
                            <FormLabel className="text-sm font-bold">Section</FormLabel>
                            <Select
                                onValueChange={fieldProps.onChange}
                                value={value as string || undefined}
                                disabled={!subjectId || availableSections.length === 0}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full h-10 bg-secondary/5 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left overflow-hidden min-w-0">
                                        <SelectValue placeholder={subjectId ? "Select a section" : "Pick a subject first"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableSections.map((sectionName) => (
                                        <SelectItem key={sectionName} value={sectionName} className="pr-8 truncate">
                                            {sectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <p className="pt-0.5 text-xs text-muted-foreground">Section requires a selected subject.</p>
        </section>
    );
}
