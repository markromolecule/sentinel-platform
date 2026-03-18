"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { Textarea } from "@sentinel/ui";
import { Calendar } from "@sentinel/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@sentinel/ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@sentinel/ui";
import { Switch } from "@sentinel/ui";
import { cn } from "@sentinel/ui";
import { useSubjectStore } from "@/stores/use-subject-store";
import { useExamCreateForm } from "../_hooks/use-exam-create-form";
import type { ExamCreateFormProps } from '@sentinel/shared/types';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export function ExamCreateForm({ onClose }: ExamCreateFormProps) {
    const subjects = useSubjectStore((state) => state.subjects);
    const { form, onSubmit, handleClose } = useExamCreateForm(onClose);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-bold">Exam Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Data Structures Midterm" className="h-11" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-bold">Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Briefly describe the coverage and instructions."
                                        className="resize-none min-h-[80px] bg-secondary/5"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="subject_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-bold">Subject</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="scheduled_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold">Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "h-11 w-full justify-start bg-secondary/5 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value
                                                        ? format(new Date(field.value), "PPP")
                                                        : "Pick a date"}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="scheduled_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold">Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" className="h-11 bg-secondary/5" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="duration_minutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold">Time Limit (minutes)</FormLabel>
                                    <FormControl>
                                        <Input type="number" className="h-11 bg-secondary/5" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="passing_score"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold">Passing Score (%)</FormLabel>
                                    <FormControl>
                                        <Input type="number" className="h-11 bg-secondary/5" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Exam Settings</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                            <FormField
                                control={form.control}
                                name="shuffle_questions"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent p-0">
                                        <FormLabel className="text-xs font-semibold text-muted-foreground/80">Shuffle Questions</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="show_correct_answers"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent p-0">
                                        <FormLabel className="text-xs font-semibold text-muted-foreground/80">Show Correct Answers</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="allow_review"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent p-0">
                                        <FormLabel className="text-xs font-semibold text-muted-foreground/80">Allow Review</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="randomize_choices"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent p-0">
                                        <FormLabel className="text-xs font-semibold text-muted-foreground/80">Randomize Choices</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-3 pt-6">
                    <Button type="button" variant="ghost" onClick={handleClose} className="font-bold text-muted-foreground">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white font-bold px-8 h-11"
                    >
                        {form.formState.isSubmitting ? "Creating..." : "Continue to Builder"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
