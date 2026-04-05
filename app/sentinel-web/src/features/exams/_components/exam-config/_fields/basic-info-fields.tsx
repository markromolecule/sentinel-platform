"use client";

import { useEffect, useMemo } from "react";
import { useEnrolledSubjectsQuery } from "@sentinel/hooks";
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
import { useFormContext, useWatch } from "react-hook-form";
import type { ExamFormFieldProps } from "./_types";
import { mapEnrolledSubjectsToExamOptions } from "@/features/exams/config/_lib/enrolled-subject-options";

export function BasicInfoFields({ control }: ExamFormFieldProps) {
    const { data: enrolledSubjects = [], isLoading } = useEnrolledSubjectsQuery();
    const { setValue } = useFormContext<ExamCreateFormValues>();

    const subjectId = useWatch({
        control,
        name: "subjectId",
    });
    const section = useWatch({
        control,
        name: "section",
    });

    const subjectOptions = useMemo(
        () => mapEnrolledSubjectsToExamOptions(enrolledSubjects),
        [enrolledSubjects],
    );
    const selectedSubject = subjectOptions.find((item) => item.id === subjectId);
    const availableSections = useMemo(
        () => selectedSubject?.sections ?? [],
        [selectedSubject],
    );

    useEffect(() => {
        if (section && !availableSections.some((item) => item.name === section)) {
            setValue("section", "", { shouldDirty: true, shouldValidate: true });
        }
    }, [availableSections, section, setValue]);

    return (
        <section className="space-y-8">
            <div className="space-y-1.5 border-b border-border/40 pb-4">
                <h3 className="text-lg font-semibold tracking-tight text-[#323d8f]">Exam Details</h3>
                <p className="text-sm font-medium text-muted-foreground/70">
                    Provide the title, subject, and section for this examination.
                </p>
            </div>

            <div className="grid gap-5">
                <FormField
                    control={control}
                    name="title"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold tracking-tight text-foreground/80">Exam Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Data Structures Midterm"
                                    className="h-11 bg-secondary/5 border-border/50 focus:bg-background transition-colors"
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
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold tracking-tight text-foreground/80">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Briefly describe the coverage and instructions."
                                    className="min-h-[80px] resize-none bg-secondary/5 border-border/50 focus:bg-background transition-colors"
                                    {...fieldProps}
                                    value={value as string}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    control={control}
                    name="subjectId"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem className="min-w-0 space-y-2">
                            <FormLabel className="text-sm font-semibold tracking-tight text-foreground/80">Subject</FormLabel>
                            <Select onValueChange={fieldProps.onChange} value={(value as string) || undefined}>
                                <FormControl>
                                    <SelectTrigger className="w-full h-11 bg-secondary/5 border-border/50 focus:bg-background transition-colors [&>span]:flex-1 [&>span]:truncate [&>span]:text-left overflow-hidden min-w-0">
                                        <SelectValue
                                            placeholder={
                                                isLoading
                                                    ? "Loading subjects..."
                                                    : "Select a subject"
                                            }
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {subjectOptions.map((subject) => (
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
                        <FormItem className="min-w-0 space-y-2">
                            <FormLabel className="text-sm font-semibold tracking-tight text-foreground/80">Section</FormLabel>
                            <Select
                                onValueChange={fieldProps.onChange}
                                value={value as string || undefined}
                                disabled={!subjectId || availableSections.length === 0}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full h-11 bg-secondary/5 border-border/50 focus:bg-background transition-colors [&>span]:flex-1 [&>span]:truncate [&>span]:text-left overflow-hidden min-w-0">
                                        <SelectValue
                                            placeholder={
                                                subjectId
                                                    ? "Select a section"
                                                    : "Pick a subject first"
                                            }
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableSections.map((sectionOption) => (
                                        <SelectItem
                                            key={sectionOption.id}
                                            value={sectionOption.name}
                                            className="pr-8 truncate"
                                        >
                                            {sectionOption.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground/60 italic">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                Only approved enrolled subjects and their assigned sections are available here.
            </p>
        </section>
    );
}
