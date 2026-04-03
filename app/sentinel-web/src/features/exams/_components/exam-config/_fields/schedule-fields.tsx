"use client";

import {
    Button,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from "@sentinel/ui";
import { useFormContext, useWatch } from "react-hook-form";
import type { ExamFormFieldProps } from "./_types";
import type { ExamCreateFormValues } from "@sentinel/shared/schema";
import {
    DEFAULT_EXAM_DURATION_MINUTES,
    formatDurationLabel,
    getDurationMinutes,
    getEndDateTimeFromDuration,
    getSchedulePreset,
} from "@/features/exams/config/_lib/exam-schedule";

const DURATION_PRESETS = [30, 60, 90, 120];

export function ScheduleFields({ control }: ExamFormFieldProps) {
    const { setValue } = useFormContext<ExamCreateFormValues>();
    const startDateTime = useWatch({ control, name: "startDateTime" });
    const endDateTime = useWatch({ control, name: "endDateTime" });
    const durationMinutes = getDurationMinutes(startDateTime, endDateTime);
    const schedulePresets = [
        { label: "Tomorrow 8:00 AM", ...getSchedulePreset(1, 8) },
        { label: "Tomorrow 1:00 PM", ...getSchedulePreset(1, 13) },
        { label: "Next Week 8:00 AM", ...getSchedulePreset(7, 8) },
    ];

    const applyDurationPreset = (duration: number) => {
        if (!startDateTime) {
            return;
        }

        setValue("endDateTime", getEndDateTimeFromDuration(startDateTime, duration), {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue("durationMinutes", duration, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const applySchedulePreset = (start: string, end: string) => {
        setValue("startDateTime", start, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue("endDateTime", end, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue("durationMinutes", DEFAULT_EXAM_DURATION_MINUTES, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    return (
        <section className="space-y-3">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold tracking-tight text-[#323d8f]">Schedule</h3>
                <p className="text-sm text-muted-foreground">
                    Set when the exam opens and closes.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <FormField
                    control={control}
                    name="startDateTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-bold">Starts At</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" className="h-10 bg-secondary/5" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="endDateTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-bold">Ends At</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" className="h-10 bg-secondary/5" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-[#323d8f]">Duration:</span>
                <span className="text-muted-foreground">{formatDurationLabel(durationMinutes)}</span>
            </div>

            <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">Quick schedule presets</p>
                <div className="flex flex-wrap gap-2">
                    {schedulePresets.map((preset) => (
                        <Button
                            key={preset.label}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-[#323d8f]/20 bg-background text-[#323d8f] shadow-sm transition-all hover:-translate-y-px hover:bg-[#323d8f]/5 hover:shadow-md focus-visible:ring-[#323d8f]/30"
                            onClick={() => applySchedulePreset(preset.startDateTime, preset.endDateTime)}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">Quick duration</p>
                <div className="flex flex-wrap gap-2">
                    {DURATION_PRESETS.map((duration) => (
                        <Button
                            key={duration}
                            type="button"
                            variant={durationMinutes === duration ? "default" : "outline"}
                            size="sm"
                            className={
                                durationMinutes === duration
                                    ? "bg-[#323d8f] text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#323d8f]/90 hover:shadow-md"
                                    : "border-[#323d8f]/20 bg-background text-[#323d8f] shadow-sm transition-all hover:-translate-y-px hover:bg-[#323d8f]/5 hover:shadow-md focus-visible:ring-[#323d8f]/30"
                            }
                            onClick={() => applyDurationPreset(duration)}
                            disabled={!startDateTime}
                        >
                            {duration >= 60 && duration % 60 === 0 ? `${duration / 60} hr` : `${duration} min`}
                        </Button>
                    ))}
                </div>
            </div>
        </section>
    );
}
