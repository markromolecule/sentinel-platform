import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
    Input,
    Textarea,
    Switch,
} from '@sentinel/ui';
import type { ExamFormFieldProps } from '../_types';
import { Type, AlignLeft, Globe } from 'lucide-react';

const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';
const inputClassName =
    'h-10 border-border/60 bg-background transition-all focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f]';
const textareaClassName =
    'min-h-[72px] resize-none border-border/60 bg-background transition-all focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f] py-3';

export function BasicDetailsFields({ control }: ExamFormFieldProps) {
    return (
        <div className="grid gap-4">
            <FormField
                control={control}
                name="title"
                render={({ field: { value, ...fieldProps } }) => (
                    <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                            <Type className="h-4 w-4 text-[#323d8f]/60" />
                            Exam Title
                        </FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Data Structures Midterm"
                                className={inputClassName}
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
                        <FormLabel className={labelClassName}>
                            <AlignLeft className="h-4 w-4 text-[#323d8f]/60" />
                            Description
                        </FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Briefly describe the coverage and instructions."
                                className={textareaClassName}
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
                name="isPublic"
                render={({ field }) => (
                    <FormItem className="border-border/60 bg-muted/5 flex flex-row items-center justify-between gap-4 space-y-0 rounded-lg border p-3.5">
                        <div className="space-y-0.5">
                            <FormLabel className="text-foreground/70 flex items-center gap-2 text-[13px] font-bold">
                                <Globe className="h-4 w-4 text-[#323d8f]/60" />
                                Public Exam
                            </FormLabel>
                            <FormDescription className="text-muted-foreground text-xs">
                                Allow other proctors and admins to view and import questions from
                                this exam.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
