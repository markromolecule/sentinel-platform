import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
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
                                Force camera on during exams.
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
                                Force microphone for audio monitoring.
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
