'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@sentinel/ui';
import { OfferedSubjectPicker } from './offered-subject-picker';
import { createRequestOfferedSubjectBuilderFormValues } from '../_lib/request-offered-subject-builder-default-values';
import type { SubjectOffering } from '@sentinel/shared/types';
import type { UseFormReturn } from 'react-hook-form';
import type { RequestOfferedSubjectBuilderFormValues } from '../_lib/request-offered-subject-builder-schema';

interface RequestOfferedSubjectBuilderPickerStepProps {
    form: UseFormReturn<RequestOfferedSubjectBuilderFormValues>;
    availableOfferings: SubjectOffering[];
    search: string;
    onSearchChange: (search: string) => void;
}

export function RequestOfferedSubjectBuilderPickerStep({
    form,
    availableOfferings,
    search,
    onSearchChange,
}: RequestOfferedSubjectBuilderPickerStepProps) {
    if (availableOfferings.length === 0 && !search) {
        return (
            <div className="border-border/60 bg-muted/10 rounded-xl border p-8 text-center">
                <p className="text-foreground text-sm font-semibold">
                    No requestable offered subjects found
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Open or draft offerings with available sections will appear here when they are
                    ready for instructor requests.
                </p>
            </div>
        );
    }

    return (
        <div className="border-border/60 bg-background rounded-xl border p-4">
            <FormField
                control={form.control}
                name="subject_offering_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="mb-4 block text-base font-semibold">
                            Select Offered Subject
                        </FormLabel>
                        <FormControl>
                            <OfferedSubjectPicker
                                subjects={availableOfferings}
                                selectedId={field.value}
                                search={search}
                                onSearchChange={onSearchChange}
                                onSelect={(value) => {
                                    form.reset(createRequestOfferedSubjectBuilderFormValues(value));
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
