import { useMemo, useState, useEffect } from 'react';
import { useUsersQuery } from '@sentinel/hooks';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from '@sentinel/ui';

export type InstructorSearchComboboxProps = {
    value?: string;
    onValueChange: (value: string) => void;
    institutionId: string;
    excludeUserIds?: string[];
    placeholder?: string;
    disabled?: boolean;
};

/**
 * InstructorSearchCombobox renders a searchable combobox populated with instructors
 * from the specified institution. It supports client-side filtering and custom display formats.
 * 
 * @param props.value - The currently selected instructor user ID
 * @param props.onValueChange - Callback when a new instructor is selected
 * @param props.institutionId - The institution ID to scope the instructor query
 * @param props.excludeUserIds - Optional list of instructor IDs to hide from the options
 * @param props.placeholder - Optional placeholder for the input field
 * @param props.disabled - Optional disabled state
 */
export function InstructorSearchCombobox({
    value = '',
    onValueChange,
    institutionId,
    excludeUserIds = [],
    placeholder = 'Select an instructor...',
    disabled = false,
}: InstructorSearchComboboxProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);

    // Query instructors scoped to the institution
    const { data: instructors = [], isLoading } = useUsersQuery({
        role: 'instructor',
        institutionId,
        enabled: Boolean(institutionId),
    });

    // Find the currently selected instructor to show their name
    const selectedInstructor = useMemo(() => {
        if (!value) return null;
        return instructors.find((i) => i.id === value) || null;
    }, [instructors, value]);

    // Format display name
    const selectedName = useMemo(() => {
        if (!selectedInstructor) return '';
        return (
            [selectedInstructor.firstName, selectedInstructor.lastName]
                .filter(Boolean)
                .join(' ') || selectedInstructor.email
        );
    }, [selectedInstructor]);

    // Track what is currently displayed in the input field
    const [displayValue, setDisplayValue] = useState('');

    // Synchronize display value with selection when dropdown is closed/opened
    useEffect(() => {
        if (!open) {
            setDisplayValue(selectedName);
            setSearchTerm('');
        }
    }, [open, selectedName]);

    // Filter list client-side based on typing
    const filteredInstructors = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        const excludeSet = new Set(excludeUserIds);

        const list = instructors.filter((instructor) => !excludeSet.has(instructor.id));

        if (!term) {
            return list;
        }

        return list.filter((instructor) => {
            const fullName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.toLowerCase();
            const email = (instructor.email || '').toLowerCase();
            return fullName.includes(term) || email.includes(term);
        });
    }, [instructors, searchTerm, excludeUserIds]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDisplayValue(val);
        setSearchTerm(val);

        // If user clears the input completely, clear the selected instructor
        if (!val) {
            onValueChange('');
        }
    };

    return (
        <Combobox
            value={value || null}
            onValueChange={(val) => {
                if (val) {
                    onValueChange(val);
                } else {
                    onValueChange('');
                }
                setOpen(false);
            }}
            open={disabled ? false : open}
            onOpenChange={setOpen}
            filter={null}
        >
            <ComboboxInput
                placeholder={placeholder}
                disabled={disabled || isLoading}
                value={displayValue}
                onChange={handleInputChange}
                showClear={Boolean(value)}
                onFocus={() => {
                    setOpen(true);
                    // Clear display value to show all options on focus, or keep search term if any
                    setDisplayValue(searchTerm);
                }}
            />
            <ComboboxContent className="w-full">
                <ComboboxList>
                    {filteredInstructors.map((instructor) => {
                        const name = [instructor.firstName, instructor.lastName]
                            .filter(Boolean)
                            .join(' ') || instructor.email;
                        return (
                            <ComboboxItem key={instructor.id} value={instructor.id}>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{name}</span>
                                    {instructor.firstName && (
                                        <span className="text-muted-foreground text-xs">
                                            {instructor.email}
                                        </span>
                                    )}
                                </div>
                            </ComboboxItem>
                        );
                    })}
                    {filteredInstructors.length === 0 && (
                        <ComboboxEmpty>
                            {isLoading ? 'Loading instructors...' : 'No instructors found'}
                        </ComboboxEmpty>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
