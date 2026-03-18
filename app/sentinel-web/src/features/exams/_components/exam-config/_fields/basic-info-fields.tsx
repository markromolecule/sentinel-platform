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
import type { ExamFormFieldProps } from "./_types";

export function BasicInfoFields({ control }: ExamFormFieldProps) {
    const subjects = useSubjectStore((state) => state.subjects);

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

            <FormField
                control={control}
                name="subjectId"
                render={({ field: { value, ...fieldProps } }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-bold">Subject</FormLabel>
                        <Select onValueChange={fieldProps.onChange} defaultValue={value as string}>
                            <FormControl>
                                <SelectTrigger className="h-11 bg-secondary/5">
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.title} ({subject.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
