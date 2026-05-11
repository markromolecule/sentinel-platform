'use client';

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
        <Card className="max-w-3xl">
            <CardHeader>
                <CardTitle>Audio Anomaly Calibration</CardTitle>
                <CardDescription>
                    Configure sensitivity, anomaly types, and cooldowns for the real-time audio
                    detection engine.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Global Sensitivity */}
                        <FormField
                            control={form.control}
                            name="sensitivityMultiplier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Global Sensitivity Multiplier ({field.value}x)
                                    </FormLabel>
                                    <FormDescription>
                                        Adjusts all thresholds proportionally. Lower value = more
                                        sensitive. (0.5 to 2.0)
                                    </FormDescription>
                                    <FormControl>
                                        <Slider
                                            min={0.5}
                                            max={2.0}
                                            step={0.1}
                                            value={[field.value]}
                                            onValueChange={(val) => field.onChange(val[0])}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Consecutive Frame Threshold */}
                            <FormField
                                control={form.control}
                                name="consecutiveFrameThreshold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consecutive Frame Threshold</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={10}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value, 10))
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            How many consecutive audio frames (~1s each) must exceed
                                            the threshold before an alert fires.
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
                                        <FormLabel>Cooldown Period (seconds)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={60}
                                                value={field.value / 1000}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        parseInt(e.target.value, 10) * 1000,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Wait time before the same anomaly type can trigger
                                            another alert.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        {/* Enabled Anomaly Types */}
                        <div>
                            <FormLabel className="mb-4 block text-base">
                                Enabled Anomaly Types
                            </FormLabel>
                            <div className="grid grid-cols-2 gap-4">
                                {AUDIO_ANOMALY_TYPES.map((type) => (
                                    <FormField
                                        key={type}
                                        control={form.control}
                                        name="enabledAnomalyTypes"
                                        render={({ field }) => {
                                            const isChecked = field.value?.includes(type);
                                            return (
                                                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([
                                                                          ...field.value,
                                                                          type,
                                                                      ])
                                                                    : field.onChange(
                                                                          field.value?.filter(
                                                                              (value) =>
                                                                                  value !== type,
                                                                          ),
                                                                      );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="cursor-pointer font-normal">
                                                        {type.replace('_', ' ')}
                                                    </FormLabel>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                ))}
                            </div>
                            {form.formState.errors.enabledAnomalyTypes && (
                                <p className="text-destructive mt-2 text-sm font-medium">
                                    {form.formState.errors.enabledAnomalyTypes.message}
                                </p>
                            )}
                        </div>

                        <Separator />

                        {/* Individual Thresholds */}
                        <div>
                            <FormLabel className="mb-4 block text-base">
                                Individual Thresholds
                            </FormLabel>
                            <FormDescription className="mb-4">
                                Baseline confidence thresholds (0.0 to 1.0) before the sensitivity
                                multiplier is applied.
                            </FormDescription>

                            <div className="space-y-6">
                                {AUDIO_ANOMALY_TYPES.map((type) => (
                                    <FormField
                                        key={type}
                                        control={form.control}
                                        name={`thresholds.${type}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel className="text-sm">
                                                        {type.replace('_', ' ')}
                                                    </FormLabel>
                                                    <span className="text-muted-foreground text-sm">
                                                        Base {field.value.toFixed(2)} • Effective{' '}
                                                        {Math.min(
                                                            1,
                                                            Math.max(
                                                                0,
                                                                field.value / sensitivityMultiplier,
                                                            ),
                                                        ).toFixed(2)}
                                                    </span>
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

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={isPending}
                            >
                                Reset to Defaults
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
            {record?.updatedAt && (
                <CardFooter className="bg-muted/50 text-muted-foreground justify-between py-3 text-xs">
                    <span>
                        Last updated: {format(new Date(record.updatedAt), 'MMM d, yyyy HH:mm:ss')}
                    </span>
                    {record?.updatedBy && <span>By user: {record.updatedBy}</span>}
                </CardFooter>
            )}
        </Card>
    );
}
