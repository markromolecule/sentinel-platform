import { FormField, FormItem, FormMessage } from '@sentinel/ui';
import { FilterableCheckboxGroup } from '@/app/(protected)/(admin)/subjects/_components/forms/filterable-checkbox-group';
import { type SubjectOfferingFormFieldsProps } from '../_types';

interface DepartmentPickerFieldProps {
    form: SubjectOfferingFormFieldsProps['form'];
    isPending: boolean;
    departmentOptions: Array<{ value: string; label: string }>;
    selectedDepartmentIds: string[];
    departmentSummary: string;
    isLocked?: boolean;
    visibleRows?: number;
    onSetDepartmentIds: (departmentIds: string[]) => void;
    onToggleDepartment: (departmentId: string) => void;
}

export function DepartmentPickerField({
    form,
    isPending,
    departmentOptions,
    selectedDepartmentIds,
    departmentSummary,
    isLocked = false,
    visibleRows = 11,
    onSetDepartmentIds,
    onToggleDepartment,
}: DepartmentPickerFieldProps) {
    return (
        <FormField
            control={form.control}
            name="department_ids"
            render={() => (
                <FormItem className="h-full">
                    <FilterableCheckboxGroup
                        title="Departments"
                        searchPlaceholder="Filter departments..."
                        emptyMessage="No departments match your search."
                        options={departmentOptions}
                        selectedValues={selectedDepartmentIds}
                        onToggle={onToggleDepartment}
                        helperText={
                            isLocked
                                ? 'Your department is assigned automatically from your account.'
                                : 'Choose the departments that can use this offering.'
                        }
                        selectionSummary={departmentSummary}
                        visibleRows={visibleRows}
                        disabled={isPending || isLocked}
                        onSetSelectedValues={onSetDepartmentIds}
                    />
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
