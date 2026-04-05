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
import type { ExamFormFieldProps } from "@/features/exams/_components/exam-config/_fields/_types";
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
        <section className="space-y-8">
            <div className="space-y-1.5 border-b border-border/40 pb-4">
                <h3 className="text-lg font-semibold tracking-tight text-[#323d8f]">Schedule</h3>
                <p className="text-sm font-medium text-muted-foreground/70">
                    Define the availability window and duration for this exam.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    control={control}
                    name="startDateTime"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold tracking-tight text-foreground/80">Starts At</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" className="h-11 bg-secondary/5 border-border/50 focus:bg-background transition-colors" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="endDateTime"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold tracking-tight text-foreground/80">Ends At</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" className="h-11 bg-secondary/5 border-border/50 focus:bg-background transition-colors" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-secondary/5 px-5 py-4 border border-border/40 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Calculated Duration</span>
                <span className="text-base font-bold text-[#323d8f]">{formatDurationLabel(durationMinutes)}</span>
            </div>

            <div className="space-y-4 pt-1">
                <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#323d8f]/60">Quick schedule presets</p>
                    <div className="flex flex-wrap gap-2">
                        {schedulePresets.map((preset) => (
                            <Button
                                key={preset.label}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 border-[#323d8f]/10 bg-background/50 text-[#323d8f] text-xs shadow-none transition-all hover:bg-[#323d8f]/5 hover:border-[#323d8f]/30"
                                onClick={() => applySchedulePreset(preset.startDateTime, preset.endDateTime)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#323d8f]/60">Quick duration</p>
                    <div className="flex flex-wrap gap-2">
                        {DURATION_PRESETS.map((duration) => (
                            <Button
                                key={duration}
                                type="button"
                                variant={durationMinutes === duration ? "default" : "outline"}
                                size="sm"
                                className={
                                    durationMinutes === duration
                                        ? "h-8 bg-[#323d8f] text-white text-xs shadow-sm"
                                        : "h-8 border-[#323d8f]/10 bg-background/50 text-[#323d8f] text-xs shadow-none transition-all hover:bg-[#323d8f]/5 hover:border-[#323d8f]/30"
                                }
                                onClick={() => applyDurationPreset(duration)}
                                disabled={!startDateTime}
                            >
                                {duration >= 60 && duration % 60 === 0 ? `${duration / 60} hr` : `${duration} min`}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
