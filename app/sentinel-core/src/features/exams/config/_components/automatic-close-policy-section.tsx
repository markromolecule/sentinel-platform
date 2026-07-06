import {
    Checkbox,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Switch,
} from '@sentinel/ui';
import { useFormContext } from 'react-hook-form';

export type AutomaticClosePolicySectionProps = {
    policyEnabled: boolean;
};

/**
 * Sub-component of the Exam Configuration that handles the Automatic Close Policy settings.
 * Renders switches, inputs, and checkboxes to define high incident limits and immediate closure rules.
 *
 * @param props - Component properties.
 * @param props.policyEnabled - Whether the automatic close policy is currently enabled.
 */
export function AutomaticClosePolicySection({ policyEnabled }: AutomaticClosePolicySectionProps) {
    const form = useFormContext();

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">Automatic close policy</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Configure thresholds for automatically closing student attempts when high-severity incidents accumulate.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <FormField
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    control={form.control as any}
                    name="configuration.automaticClosePolicy.enabled"
                    render={({ field }) => (
                        <FormItem className="border-border/60 flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-1">
                                <FormLabel className="text-sm font-medium">Enable automatic close</FormLabel>
                                <FormDescription className="text-sm text-muted-foreground">
                                    Automatically lock and close the attempt if incident thresholds are exceeded.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value !== false}
                                    onCheckedChange={field.onChange}
                                    className="sm:mt-0.5"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {policyEnabled && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-border/60 p-4 bg-muted/20">
                        <FormField
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            control={form.control as any}
                            name="configuration.automaticClosePolicy.highIncidentThreshold"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">High Incident Threshold</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            value={field.value ?? 3}
                                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 3)}
                                            className="bg-background"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Number of HIGH incidents before closing.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            control={form.control as any}
                            name="configuration.automaticClosePolicy.windowMinutes"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monitoring Window (minutes)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...field}
                                            value={field.value ?? 15}
                                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 15)}
                                            className="bg-background"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Incident tracking timeframe window.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            control={form.control as any}
                            name="configuration.automaticClosePolicy.useOccurrenceCount"
                            render={({ field }) => (
                                <FormItem className="col-span-1 sm:col-span-2 border-border/60 flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-start sm:justify-between bg-background">
                                    <div className="min-w-0 space-y-1">
                                        <FormLabel className="text-sm font-medium">Use Incident Occurrence Count</FormLabel>
                                        <FormDescription className="text-sm text-muted-foreground">
                                            Sums individual occurrences of incidents rather than unique incident records.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={!!field.value}
                                            onCheckedChange={field.onChange}
                                            className="sm:mt-0.5"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="col-span-1 sm:col-span-2 space-y-2">
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Immediate Close Events</FormLabel>
                            <FormDescription className="text-xs">
                                Instantly close and lock the attempt if any of these event types are detected.
                            </FormDescription>
                            <FormField
                                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                control={form.control as any}
                                name="configuration.automaticClosePolicy.immediateCloseEventTypes"
                                render={({ field }) => {
                                    const values = field.value || [];
                                    const handleCheckedChange = (checked: boolean, eventType: string) => {
                                        if (checked) {
                                            field.onChange([...values, eventType]);
                                        } else {
                                            field.onChange(values.filter((v: string) => v !== eventType));
                                        }
                                    };
                                    return (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2">
                                            {[
                                                { value: 'fullscreen_exit', label: 'Fullscreen Exit' },
                                                { value: 'face_lost', label: 'Face Lost' },
                                                { value: 'multiple_faces', label: 'Multiple Faces' },
                                                { value: 'audio_anomaly', label: 'Audio Anomaly' },
                                            ].map((item) => (
                                                <label key={item.value} className="flex items-center gap-2 text-sm cursor-pointer border border-border/60 rounded-xl px-3 py-2 hover:bg-accent/10 bg-background">
                                                    <Checkbox
                                                        checked={values.includes(item.value)}
                                                        onCheckedChange={(checked) => handleCheckedChange(!!checked, item.value)}
                                                    />
                                                    <span>{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
