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
        <section className="space-y-3">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold tracking-tight text-[#323d8f]">Rules and Options</h3>
                <p className="text-sm text-muted-foreground">
                    Pass mark and student options.
                </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
                <div className="space-y-2 pt-0.5">
                    <h4 className="text-sm font-semibold tracking-tight text-foreground">Exam Settings</h4>
                    <div className="grid gap-2">
                        <FormField
                            control={control}
                            name="shuffleQuestions"
                            render={({ field: { value, ...fieldProps } }) => (
                                <FormItem className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 space-y-0">
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
                                <FormItem className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 space-y-0">
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
                                <FormItem className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 space-y-0">
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
                                <FormItem className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 space-y-0">
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

                <FormField
                    control={control}
                    name="passingScore"
                    render={({ field: { value, ...fieldProps } }) => (
                        <FormItem className="lg:justify-self-end">
                            <FormLabel className="text-sm font-semibold">Passing Score (%)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    className="h-10 w-24 bg-secondary/5 text-center"
                                    {...fieldProps}
                                    value={value as number}
                                    min={0}
                                    max={100}
                                    step={5}
                                    onChange={e => fieldProps.onChange(parseInt(e.target.value) || 0)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </section>
    );
}
