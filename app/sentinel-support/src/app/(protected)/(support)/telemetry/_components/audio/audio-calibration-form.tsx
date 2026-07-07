import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Button,
    Slider,
    Input,
    Checkbox,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Separator,
} from '@sentinel/ui';
import {
    audioAnomalyConfigSchema,
    AUDIO_ANOMALY_TYPES,
    DEFAULT_AUDIO_ANOMALY_CONFIG,
    type AudioAnomalySettingsRecord,
    type AudioAnomalyConfigSchemaValues,
} from '@sentinel/shared';
import { format } from 'date-fns';

export type AudioCalibrationFormProps = {
    record?: AudioAnomalySettingsRecord;
    isPending: boolean;
    onSubmit: (payload: AudioAnomalyConfigSchemaValues) => void;
};

/**
 * Renders a widescreen dashboard form for configuring the real-time audio anomaly detection engine,
 * splitting layout between general parameters and specific audio threshold sensitivity sliders.
 */
export function AudioCalibrationForm({ record, isPending, onSubmit }: AudioCalibrationFormProps) {
    const hardcodedDefaults: AudioAnomalyConfigSchemaValues = {
        ...DEFAULT_AUDIO_ANOMALY_CONFIG,
        thresholds: { ...DEFAULT_AUDIO_ANOMALY_CONFIG.thresholds },
        enabledAnomalyTypes: [...DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes],
    };
    const defaultValues: AudioAnomalyConfigSchemaValues = record?.value || hardcodedDefaults;

    const form = useForm<AudioAnomalyConfigSchemaValues>({
        resolver: zodResolver(audioAnomalyConfigSchema),
        defaultValues,
    });

    const sensitivityMultiplier = form.watch('sensitivityMultiplier');

    const handleReset = () => {
        form.reset(hardcodedDefaults);
        onSubmit(hardcodedDefaults);
    };

    return (
        <Card className="border-primary/10 w-full overflow-hidden py-0">
            <CardHeader className="bg-muted/30 border-b py-5">
                <CardTitle className="text-lg">Audio Anomaly Calibration</CardTitle>
                <CardDescription className="text-xs">
                    Configure global sensitivity, consecutive frame evaluation parameters, and
                    individual anomaly confidence thresholds for the real-time audio analytics
                    engine.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            {/* Left Column - General and Config (span 5) */}
                            <div className="space-y-6 lg:col-span-5">
                                <div className="space-y-4">
                                    <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                        General Configuration
                                    </h3>

                                    {/* Global Sensitivity */}
                                    <FormField
                                        control={form.control}
                                        name="sensitivityMultiplier"
                                        render={({ field }) => (
                                            <FormItem className="bg-muted/30 rounded-xl border p-4">
                                                <FormLabel className="text-sm font-semibold">
                                                    Global Sensitivity Multiplier ({field.value}x)
                                                </FormLabel>
                                                <FormDescription className="text-xs leading-normal">
                                                    Adjusts all thresholds proportionally. Higher
                                                    values lower the effective threshold and make
                                                    detection more sensitive. (0.5 to 2.0)
                                                </FormDescription>
                                                <FormControl className="pt-2">
                                                    <Slider
                                                        min={0.5}
                                                        max={2.0}
                                                        step={0.1}
                                                        value={[field.value]}
                                                        onValueChange={(val) =>
                                                            field.onChange(val[0])
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Cooldown & Frame threshold */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Consecutive Frame Threshold */}
                                        <FormField
                                            control={form.control}
                                            name="consecutiveFrameThreshold"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold">
                                                        Consecutive Frame Threshold
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={10}
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    parseInt(e.target.value, 10),
                                                                )
                                                            }
                                                            className="h-9 text-xs"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-[10px] leading-snug">
                                                        Consecutive 1s frames before alerting.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Cooldown Period */}
                                        <FormField
                                            control={form.control}
                                            name="cooldownMs"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold">
                                                        Cooldown (seconds)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={60}
                                                            value={field.value / 1000}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    parseInt(e.target.value, 10) *
                                                                        1000,
                                                                )
                                                            }
                                                            className="h-9 text-xs"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-[10px] leading-snug">
                                                        Wait time before re-triggering.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Enabled Anomaly Types */}
                                <div className="space-y-4">
                                    <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                        Enabled Anomaly Types
                                    </h3>
                                    <div className="bg-muted/30 space-y-4 rounded-xl border p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {AUDIO_ANOMALY_TYPES.map((type) => (
                                                <FormField
                                                    key={type}
                                                    control={form.control}
                                                    name="enabledAnomalyTypes"
                                                    render={({ field }) => {
                                                        const isChecked =
                                                            field.value?.includes(type);
                                                        return (
                                                            <FormItem className="flex flex-row items-center space-y-0 space-x-3">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) => {
                                                                            return checked
                                                                                ? field.onChange([
                                                                                      ...field.value,
                                                                                      type,
                                                                                  ])
                                                                                : field.onChange(
                                                                                      field.value?.filter(
                                                                                          (value) =>
                                                                                              value !==
                                                                                              type,
                                                                                      ),
                                                                                  );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="cursor-pointer text-xs leading-none font-medium">
                                                                    {type.replace(/_/g, ' ')}
                                                                </FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        {form.formState.errors.enabledAnomalyTypes && (
                                            <p className="text-destructive mt-1 text-xs font-medium">
                                                {form.formState.errors.enabledAnomalyTypes.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Threshold Sensitivity Sliders (span 7) */}
                            <div className="space-y-6 lg:col-span-7">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                            Anomaly Sensitivity Tuning
                                        </h3>
                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            Baseline confidence thresholds (0.0 to 1.0). The
                                            effective sensitivity is adjusted dynamically in
                                            response to your Global Sensitivity Multiplier.
                                        </p>
                                    </div>

                                    <div className="bg-muted/10 space-y-6 rounded-xl border p-5">
                                        {AUDIO_ANOMALY_TYPES.map((type) => (
                                            <FormField
                                                key={type}
                                                control={form.control}
                                                name={`thresholds.${type}`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-foreground/90 text-sm font-semibold capitalize">
                                                                {type
                                                                    .toLowerCase()
                                                                    .replace(/_/g, ' ')}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-muted text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] font-medium">
                                                                    Base {field.value.toFixed(2)}
                                                                </span>
                                                                <span className="rounded border border-[#323d8f]/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-[#323d8f] dark:bg-blue-500/20 dark:text-blue-300">
                                                                    Effective{' '}
                                                                    {Math.min(
                                                                        1,
                                                                        Math.max(
                                                                            0,
                                                                            field.value /
                                                                                sensitivityMultiplier,
                                                                        ),
                                                                    ).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <FormControl>
                                                            <Slider
                                                                min={0}
                                                                max={1.0}
                                                                step={0.05}
                                                                value={[field.value as number]}
                                                                onValueChange={(val) =>
                                                                    field.onChange(val[0])
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex justify-end gap-4 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={isPending}
                                className="h-10 text-xs font-semibold"
                            >
                                Reset to Defaults
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="h-10 min-w-[120px] bg-[#323d8f] text-xs font-semibold text-white shadow-sm hover:bg-[#323d8f]/90"
                            >
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
            {record?.updatedAt && (
                <CardFooter className="bg-muted/30 text-muted-foreground justify-between border-t py-3 text-xs">
                    <span>
                        Last updated: {format(new Date(record.updatedAt), 'MMM d, yyyy HH:mm:ss')}
                    </span>
                    {record?.updatedBy && <span>By user: {record.updatedBy}</span>}
                </CardFooter>
            )}
        </Card>
    );
}
