import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from '@sentinel/ui';
import type { ExamConfigurationState } from '@sentinel/services';
import { useFormContext } from 'react-hook-form';

export function SecuritySettingsSection() {
    const { control } = useFormContext<ExamConfigurationState>();

    return (
        <div className="grid gap-3 md:grid-cols-2">
            <FormField
                control={control}
                name="configuration.maxReconnectAttempts"
                render={({ field }) => (
                    <FormItem className="border-border/60 rounded-2xl border px-4 py-3">
                        <FormLabel className="text-sm font-medium">Reconnect attempts</FormLabel>
                        <FormDescription className="mb-3 text-sm leading-relaxed">
                            How many times a student can recover the session after losing
                            connection.
                        </FormDescription>
                        <FormControl>
                            <Input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                className="h-10"
                                value={field.value}
                                onChange={(event) =>
                                    field.onChange(Number(event.target.value) || 0)
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="configuration.autoSubmitTimeoutMinutes"
                render={({ field }) => (
                    <FormItem className="border-border/60 rounded-2xl border px-4 py-3">
                        <FormLabel className="text-sm font-medium">Auto-submit timeout</FormLabel>
                        <FormDescription className="mb-3 text-sm leading-relaxed">
                            Minutes to wait before an interrupted attempt is submitted
                            automatically.
                        </FormDescription>
                        <FormControl>
                            <Input
                                type="number"
                                min={0}
                                inputMode="numeric"
                                className="h-10"
                                value={field.value}
                                onChange={(event) =>
                                    field.onChange(Number(event.target.value) || 0)
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
