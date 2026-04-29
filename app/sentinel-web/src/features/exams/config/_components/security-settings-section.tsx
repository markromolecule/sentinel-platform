import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Switch,
} from '@sentinel/ui';
import type { ExamConfigurationState } from '@sentinel/services';
import { useFormContext } from 'react-hook-form';

export function SecuritySettingsSection() {
    const { control } = useFormContext<ExamConfigurationState>();

    return (
        <div className="grid gap-3 md:grid-cols-2">
            <FormField
                control={control}
                name="configuration.lobbyAdmissionMode"
                render={({ field }) => (
                    <FormItem className="border-border/60 flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-start sm:justify-between md:col-span-2">
                        <div className="min-w-0 space-y-1">
                            <FormLabel className="text-sm leading-none font-medium">
                                Require instructor approval to enter exam (Instructor-Gated Lobby)
                            </FormLabel>
                            <FormDescription className="text-sm leading-relaxed">
                                Students remain in the lobby until an instructor admits them.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value === 'INSTRUCTOR_GATED'}
                                onCheckedChange={(checked) =>
                                    field.onChange(checked ? 'INSTRUCTOR_GATED' : 'AUTOMATIC')
                                }
                                className="sm:mt-0.5"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
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
