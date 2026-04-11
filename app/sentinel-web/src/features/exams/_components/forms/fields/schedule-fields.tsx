'use client';

import type { ReactNode } from 'react';
import {
    Button,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from '@sentinel/ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { ExamFormSection } from '@/features/exams/_components/forms/components';
import type { ExamFormFieldProps } from '@/features/exams/_components/forms/fields/_types';
import type { ExamCreateFormValues } from '@sentinel/shared/schema';
import {
    DEFAULT_EXAM_DURATION_MINUTES,
    formatDurationLabel,
    getDurationMinutes,
    getEndDateTimeFromDuration,
    getSchedulePreset,
} from '@/features/exams/config/_lib/exam-schedule';
import { CalendarIcon, ClockIcon } from 'lucide-react';

const DURATION_PRESETS = [30, 60, 90, 120];
const labelClassName = 'text-[12px] font-bold text-foreground/70 flex items-center gap-2';
const inputClassName = 'h-10 border-border/60 bg-background transition-all focus:ring-2 focus:ring-[#323d8f]/20 focus:border-[#323d8f]';

type PresetGroupProps = {
    title: string;
    children: ReactNode;
};

function PresetGroup({ children, title }: PresetGroupProps) {
    return (
        <div className="space-y-2">
            <p className="text-[12px] font-bold text-foreground/80">{title}</p>
            <div className="flex flex-wrap gap-1.5">{children}</div>
        </div>
    );
}

export function ScheduleFields({ control }: ExamFormFieldProps) {
    const { setValue } = useFormContext<ExamCreateFormValues>();
    const startDateTime = useWatch({ control, name: 'startDateTime' });
    const endDateTime = useWatch({ control, name: 'endDateTime' });
    const durationMinutes = getDurationMinutes(startDateTime, endDateTime);
    const schedulePresets = [
        { label: 'Tomorrow 8 AM', ...getSchedulePreset(1, 8) },
        { label: 'Tomorrow 1 PM', ...getSchedulePreset(1, 13) },
        { label: 'Next Week 8 AM', ...getSchedulePreset(7, 8) },
    ];

    const applyDurationPreset = (duration: number) => {
        if (!startDateTime) {
            return;
        }

        setValue('endDateTime', getEndDateTimeFromDuration(startDateTime, duration), {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue('durationMinutes', duration, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const applySchedulePreset = (start: string, end: string) => {
        setValue('startDateTime', start, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue('endDateTime', end, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue('durationMinutes', DEFAULT_EXAM_DURATION_MINUTES, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    return (
        <ExamFormSection
            title="Schedule"
            description="Configure the availability window and duration."
        >
            <div className="flex flex-col gap-6">
                <div className="grid gap-4">
                    <FormField
                        control={control}
                        name="startDateTime"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className={labelClassName}>
                                    <CalendarIcon className="h-3.5 w-3.5 text-[#323d8f]/60" />
                                    Starts At
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        className={inputClassName}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="endDateTime"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className={labelClassName}>
                                    <ClockIcon className="h-3.5 w-3.5 text-[#323d8f]/60" />
                                    Ends At
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        className={inputClassName}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-5">
                    <PresetGroup title="Presets">
                        {schedulePresets.map((preset) => (
                            <Button
                                key={preset.label}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 border-border/60 bg-background px-3 text-[12px] font-semibold text-foreground/80 shadow-none transition-all hover:bg-[#323d8f]/5 hover:text-[#323d8f] hover:border-[#323d8f]/30"
                                onClick={() =>
                                    applySchedulePreset(preset.startDateTime, preset.endDateTime)
                                }
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </PresetGroup>

                    <PresetGroup title="Duration">
                        {DURATION_PRESETS.map((duration) => (
                            <Button
                                key={duration}
                                type="button"
                                variant={durationMinutes === duration ? 'default' : 'outline'}
                                size="sm"
                                className={
                                    durationMinutes === duration
                                        ? 'h-8 bg-[#323d8f] px-3 text-[12px] font-bold text-white shadow-sm'
                                        : 'h-8 border-border/60 bg-background px-3 text-[12px] font-semibold text-foreground/80 shadow-none transition-all hover:bg-[#323d8f]/5 hover:text-[#323d8f] hover:border-[#323d8f]/30'
                                }
                                onClick={() => applyDurationPreset(duration)}
                                disabled={!startDateTime}
                            >
                                {duration >= 60 && duration % 60 === 0
                                    ? `${duration / 60} hr`
                                    : `${duration} min`}
                            </Button>
                        ))}
                    </PresetGroup>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-[#323d8f]/5 px-4 py-3">
                    <p className="text-[11px] font-bold tracking-wider text-[#323d8f]/60 uppercase">
                        Total Time
                    </p>
                    <p className="text-xl font-black text-[#323d8f]">
                        {formatDurationLabel(durationMinutes)}
                    </p>
                </div>
            </div>
        </ExamFormSection>
    );
}
