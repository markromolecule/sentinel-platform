import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@sentinel/ui";
import { Switch } from "@sentinel/ui";
import { useFormContext } from "react-hook-form";
import { FormValues } from '@sentinel/shared/types';;

export function DeviceHardwareSection() {
    const { control } = useFormContext<FormValues>();

    return (
        <div className="space-y-3">
            <FormField
                control={control}
                name="cameraRequired"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">Camera</FormLabel>
                            <FormDescription>
                                Require camera permission and an active video feed.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="micRequired"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">Microphone</FormLabel>
                            <FormDescription>
                                Require microphone permission for audio analysis.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="strictMode"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">Strict Mode</FormLabel>
                            <FormDescription>
                                Enforce the full security profile without relaxed fallbacks.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="screenLock"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">Screen Lock</FormLabel>
                            <FormDescription>
                                Require the exam to stay locked to the active exam surface.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
