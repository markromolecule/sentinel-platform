import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { useFormContext } from "react-hook-form";
import { FormValues } from '@sentinel/shared/types';;

export function BasicInfoSection() {
    const { control } = useFormContext<FormValues>();

    return (
        <FormField
            control={control}
            name="name"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Policy Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Default Strict Policy" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
