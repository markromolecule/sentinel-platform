"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Button,
    Calendar,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@sentinel/ui";
import { cn } from "@sentinel/ui";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ExamFormFieldProps } from "./_types";

export function ScheduleFields({ control }: ExamFormFieldProps) {
    return (
        <div className="grid grid-cols-2 gap-6">
            <FormField
                control={control}
                name="scheduledDate"
                render={({ field: { value, ...fieldProps } }) => (
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
                                            !value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {value
                                            ? format(new Date(value as string), "PPP")
                                            : "Pick a date"}
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={value ? new Date(value as string) : undefined}
                                    onSelect={(date) => fieldProps.onChange(date ? date.toISOString() : undefined)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="scheduledTime"
                render={({ field: { value, ...fieldProps } }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-bold">Time</FormLabel>
                        <FormControl>
                            <Input type="time" className="h-11 bg-secondary/5" {...fieldProps} value={value as string} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
