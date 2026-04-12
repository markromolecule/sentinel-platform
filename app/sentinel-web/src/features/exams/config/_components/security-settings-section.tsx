import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { useFormContext } from "react-hook-form";
import { FormValues } from '@sentinel/shared/types';

export function SecuritySettingsSection() {
    const { control } = useFormContext<FormValues>();

    return (
        <div className="grid gap-3 md:grid-cols-2">
            <FormField
                control={control}
                name="maxReconnectAttempts"
                render={({ field }) => (
                    <FormItem className="rounded-xl border p-4">
                        <FormLabel>Reconnect Attempts</FormLabel>
                        <p className="mb-3 text-xs text-muted-foreground">
                            How many times a student can recover the session after connection loss.
                        </p>
                        <FormControl>
                            <Input
                                type="number"
                                className="h-9"
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
                name="autoSubmitTimeoutMinutes"
                render={({ field }) => (
                    <FormItem className="rounded-xl border p-4">
                        <FormLabel>Auto-Submit Timeout</FormLabel>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Minutes to wait before automatically submitting an interrupted attempt.
                        </p>
                        <FormControl>
                            <Input
                                type="number"
                                className="h-9"
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
