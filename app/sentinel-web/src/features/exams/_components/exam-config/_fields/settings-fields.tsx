"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Switch,
} from "@sentinel/ui";
import type { ExamFormFieldProps } from "./_types";

export function SettingsFields({ control }: ExamFormFieldProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <FormField
                    control={control}
                    name="durationMinutes"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold">Duration (minutes)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    className="h-11 bg-secondary/5"
                                    {...fieldProps}
                                    value={value as number}
                                    onChange={e => fieldProps.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="passingScore"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-semibold">Passing Score (%)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    className="h-11 bg-secondary/5"
                                    {...fieldProps}
                                    value={value as number}
                                    onChange={e => fieldProps.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-4 pt-2">
                <h4 className="text-base font-semibold tracking-tight text-foreground">Exam Settings</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <FormField
                        control={control}
                        name="shuffleQuestions"
                        render={({ field: { value, ...fieldProps } }) => (
                            <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent p-0">
                                <FormLabel className="text-sm font-medium text-muted-foreground">Shuffle Questions</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={!!value}
                                        onCheckedChange={fieldProps.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="showCorrectAnswers"
                        render={({ field: { value, ...fieldProps } }) => (
                            <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent p-0">
                                <FormLabel className="text-sm font-medium text-muted-foreground">Show Correct Answers</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={!!value}
                                        onCheckedChange={fieldProps.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="allowReview"
                        render={({ field: { value, ...fieldProps } }) => (
                            <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent p-0">
                                <FormLabel className="text-sm font-medium text-muted-foreground">Allow Review</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={!!value}
                                        onCheckedChange={fieldProps.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="randomizeChoices"
                        render={({ field: { value, ...fieldProps } }) => (
                            <FormItem className="flex items-center justify-between space-y-0 rounded-lg border border-transparent p-0">
                                <FormLabel className="text-sm font-medium text-muted-foreground">Randomize Choices</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={!!value}
                                        onCheckedChange={fieldProps.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
