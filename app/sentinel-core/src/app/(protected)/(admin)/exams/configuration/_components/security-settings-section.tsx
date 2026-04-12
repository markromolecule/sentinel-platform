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
        <div className="grid grid-cols-2 gap-3">
            <FormField
                control={control}
                name="maxReconnectAttempts"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Max Reconnect Attempts</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                className="h-8"
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
                    <FormItem>
                        <FormLabel>Auto-Submit Timeout (mins)</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                className="h-8"
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
