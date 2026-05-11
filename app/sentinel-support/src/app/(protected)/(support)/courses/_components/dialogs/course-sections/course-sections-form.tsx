import { Plus, X } from 'lucide-react';
import {
    UseFormReturn,
    FieldArrayWithId,
    UseFieldArrayAppend,
    UseFieldArrayRemove,
} from 'react-hook-form';
import {
    Button,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { BulkSectionsFormValues } from './_types';

interface CourseSectionsFormProps {
    form: UseFormReturn<BulkSectionsFormValues>;
    fields: FieldArrayWithId<BulkSectionsFormValues, 'sections', 'id'>[];
    append: UseFieldArrayAppend<BulkSectionsFormValues, 'sections'>;
    remove: UseFieldArrayRemove;
    isPending: boolean;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function CourseSectionsForm({
    form,
    fields,
    append,
    remove,
    isPending,
    onSubmit,
}: CourseSectionsFormProps) {
    return (
        <div className="flex h-full flex-col gap-6 overflow-y-auto">
            <div>
                <h3 className="text-base font-semibold">Add New Sections</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                    Create multiple sections at once.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Section List
                            </FormLabel>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => append({ name: '', year_level: undefined })}
                                disabled={isPending}
                            >
                                <Plus className="mr-1 h-3 w-3" />
                                Add Row
                            </Button>
                        </div>

                        <div className="max-h-[450px] space-y-3 overflow-y-auto pr-2 pb-2">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="group bg-muted/30 relative flex items-start gap-3 rounded-lg border p-3"
                                >
                                    <FormField
                                        control={form.control}
                                        name={`sections.${index}.name`}
                                        render={({ field: nameField }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Name (e.g. BSIT-1A)"
                                                        className="h-8 text-sm"
                                                        disabled={isPending}
                                                        {...nameField}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`sections.${index}.year_level`}
                                        render={({ field: yearField }) => (
                                            <FormItem className="w-24">
                                                <Select
                                                    disabled={isPending}
                                                    onValueChange={(val) =>
                                                        yearField.onChange(
                                                            val ? Number(val) : undefined,
                                                        )
                                                    }
                                                    value={
                                                        yearField.value
                                                            ? String(yearField.value)
                                                            : ''
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-8 text-sm">
                                                            <SelectValue placeholder="Year" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5].map((year) => (
                                                            <SelectItem
                                                                key={year}
                                                                value={String(year)}
                                                            >
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive h-7 w-7 shrink-0"
                                        disabled={fields.length === 1 || isPending}
                                        onClick={() => remove(index)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save New Sections'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
