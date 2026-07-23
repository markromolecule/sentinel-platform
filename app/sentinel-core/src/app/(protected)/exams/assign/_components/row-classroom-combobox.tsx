'use client';

import * as React from 'react';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from '@sentinel/ui';
import { type ClassroomSummary } from '@sentinel/shared/types';

export interface RowClassroomComboboxProps extends React.ComponentPropsWithoutRef<'input'> {
    value: string;
    onValueChange: (value: string) => void;
    classrooms: ClassroomSummary[];
    disabled?: boolean;
}

/**
 * RowClassroomCombobox provides a searchable dropdown for selecting classrooms in the classroom assignments builder.
 */
export const RowClassroomCombobox = React.forwardRef<HTMLInputElement, RowClassroomComboboxProps>(
    (
        {
            value,
            onValueChange,
            classrooms,
            disabled = false,
            placeholder = 'Select classroom',
            'aria-invalid': ariaInvalid,
            'aria-describedby': ariaDescribedby,
            ...props
        },
        ref,
    ) => {
        const [searchTerm, setSearchTerm] = React.useState('');
        const [open, setOpen] = React.useState(false);

        // Find the currently selected classroom to display its name
        const selectedClassroom = React.useMemo(() => {
            if (!value || value === 'none') return null;
            return classrooms.find((c) => c.id === value) || null;
        }, [classrooms, value]);

        // Format display string
        const selectedName = React.useMemo(() => {
            if (!selectedClassroom) return '';
            return selectedClassroom.className || selectedClassroom.scopeSummary.sectionLabel || '';
        }, [selectedClassroom]);

        // Track what is currently typed/displayed in the input field
        const [displayValue, setDisplayValue] = React.useState('');

        // Synchronize display value with selection when dropdown opens or closes
        React.useEffect(() => {
            if (!open) {
                setDisplayValue(selectedName);
                setSearchTerm('');
            }
        }, [open, selectedName]);

        // Filter list client-side based on search term
        const filteredClassrooms = React.useMemo(() => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return classrooms;

            return classrooms.filter((cls) => {
                const name = (cls.className || '').toLowerCase();
                const section = (cls.scopeSummary.sectionLabel || '').toLowerCase();
                const subject = (cls.subjectCode || '').toLowerCase();
                return name.includes(term) || section.includes(term) || subject.includes(term);
            });
        }, [classrooms, searchTerm]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setDisplayValue(val);
            setSearchTerm(val);

            // If user clears the input completely, clear the selected value (set to 'none')
            if (!val) {
                onValueChange('none');
            }
        };

        return (
            <Combobox
                value={value === 'none' ? null : value}
                onValueChange={(val) => {
                    onValueChange(val || 'none');
                    setOpen(false);
                }}
                open={disabled ? false : open}
                onOpenChange={setOpen}
                filter={null}
            >
                <ComboboxInput
                    ref={ref}
                    placeholder={placeholder}
                    disabled={disabled}
                    value={open ? displayValue : selectedName || ''}
                    onChange={handleInputChange}
                    showClear={value !== 'none'}
                    aria-invalid={ariaInvalid}
                    aria-describedby={ariaDescribedby}
                    className="w-full bg-white dark:bg-zinc-950"
                    onFocus={() => {
                        setOpen(true);
                        setDisplayValue(searchTerm);
                    }}
                    {...props}
                />
                <ComboboxContent className="w-full min-w-[240px] rounded-md border border-zinc-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-950">
                    <ComboboxList className="max-h-60 overflow-y-auto p-1">
                        {filteredClassrooms.map((cls) => {
                            const name = cls.className || cls.scopeSummary.sectionLabel;
                            const detail = `${cls.subjectCode} - ${cls.scopeSummary.termLabel}`;
                            return (
                                <ComboboxItem key={cls.id} value={cls.id}>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            {name}
                                        </span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {detail}
                                        </span>
                                    </div>
                                </ComboboxItem>
                            );
                        })}
                        {filteredClassrooms.length === 0 && (
                            <ComboboxEmpty className="py-2 text-center text-xs text-zinc-500">
                                No classrooms found
                            </ComboboxEmpty>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        );
    },
);

RowClassroomCombobox.displayName = 'RowClassroomCombobox';
