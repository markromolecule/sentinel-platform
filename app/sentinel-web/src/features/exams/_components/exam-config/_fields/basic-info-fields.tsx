"use client";

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
import { useSubjectStore } from "@/stores/use-subject-store";
import { useWatch } from "react-hook-form";
import type { ExamFormFieldProps } from "./_types";

export function BasicInfoFields({ control }: ExamFormFieldProps) {
    const subjects = useSubjectStore((state) => state.subjects);
    const masterSubjects = useSubjectStore((state) => state.masterSubjects);

    const subjectId = useWatch({
        control,
        name: "subjectId",
    });

    const selectedSubject = subjects.find(s => s.id === subjectId);
    const relatedMaster = selectedSubject ? masterSubjects.find(ms => ms.code === selectedSubject.code) : null;
    const availableSections = relatedMaster?.sections || [];

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="title"
                render={({ field: { value, ...fieldProps } }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-bold">Exam Title</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="e.g., Data Structures Midterm" 
                                className="h-11" 
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
                                className="resize-none min-h-[80px] bg-secondary/5"
                                {...fieldProps}
                                value={value as string}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="subjectId"
                render={({ field: { value, ...fieldProps } }) => (
                    <FormItem className="min-w-0">
                        <FormLabel className="text-sm font-bold">Subject</FormLabel>
                        <Select onValueChange={fieldProps.onChange} defaultValue={value as string}>
                            <FormControl>
                                <SelectTrigger className="w-full h-11 bg-secondary/5 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left overflow-hidden min-w-0">
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
                                <SelectTrigger className="w-full h-11 bg-secondary/5 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left overflow-hidden min-w-0">
                                    <SelectValue placeholder="Select a section" />
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
        </div>
    );
}
