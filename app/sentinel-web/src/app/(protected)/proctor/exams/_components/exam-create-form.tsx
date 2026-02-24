"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useSubjectStore } from "@/stores/use-subject-store";
import { useExamCreateForm } from "../_hooks/use-exam-create-form";
import { EXAM_DIFFICULTY_OPTIONS } from '@sentinel/shared/constants';
import type { ExamCreateFormProps } from '@sentinel/shared/types';

export function ExamCreateForm({ onClose }: ExamCreateFormProps) {
    const subjects = useSubjectStore((state) => state.subjects);
    const { form, onSubmit, handleClose } = useExamCreateForm(onClose);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exam Title *</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Data Structures Midterm Exam" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="subject_id"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Subject *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="truncate">
                                            <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id}>
                                                {subject.code} - {subject.title}
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
                        name="difficulty"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Difficulty *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a difficulty" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {EXAM_DIFFICULTY_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="duration_minutes"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Duration (minutes) *</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="passing_score"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Passing Score (%) *</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Brief instructions or summary about the exam..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="scheduled_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Scheduled Date *</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
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
                            <FormItem className="flex flex-col">
                                <FormLabel>Scheduled Time *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type="time" {...field} className="pl-9" />
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        {form.formState.isSubmitting ? "Creating..." : "Create Exam"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
