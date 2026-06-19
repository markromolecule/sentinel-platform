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
import { type MasterSubject } from '@sentinel/shared';

export interface SubjectSearchComboboxProps {
    value?: string;
    onValueChange: (value: string) => void;
    subjects: MasterSubject[];
    isLoading?: boolean;
    disabled?: boolean;
}

/**
 * SubjectSearchCombobox renders a searchable combobox containing subjects,
 * supporting client-side filtering on subject code and title.
 *
 * @param props.value - The currently selected subject ID.
 * @param props.onValueChange - Callback triggered when the selection changes.
 * @param props.subjects - Array of subjects to display.
 * @param props.isLoading - Whether the subjects list is loading.
 * @param props.disabled - Whether the select element is disabled.
 */
export function SubjectSearchCombobox({
    value = '',
    onValueChange,
    subjects,
    isLoading = false,
    disabled = false,
}: SubjectSearchComboboxProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [open, setOpen] = React.useState(false);

    // Find the currently selected subject to display its code & title
    const selectedSubject = React.useMemo(() => {
        if (!value) return null;
        return subjects.find((s) => (s.id || s.subject_id) === value) || null;
    }, [subjects, value]);

    // Format display string
    const selectedName = React.useMemo(() => {
        if (!selectedSubject) return '';
        const code = selectedSubject.code || selectedSubject.subject_code || '';
        const title = selectedSubject.title || selectedSubject.subject_title || '';
        return code && title ? `${code} - ${title}` : code || title || '';
    }, [selectedSubject]);

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
    const filteredSubjects = React.useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return subjects;

        return subjects.filter((subject) => {
            const code = (subject.code || subject.subject_code || '').toLowerCase();
            const title = (subject.title || subject.subject_title || '').toLowerCase();
            return code.includes(term) || title.includes(term);
        });
    }, [subjects, searchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDisplayValue(val);
        setSearchTerm(val);

        // If user clears the input completely, clear the selected value
        if (!val) {
            onValueChange('');
        }
    };

    return (
        <Combobox
            value={value || null}
            onValueChange={(val) => {
                onValueChange(val || '');
                setOpen(false);
            }}
            open={disabled ? false : open}
            onOpenChange={setOpen}
            filter={null}
        >
            <ComboboxInput
                placeholder={isLoading ? 'Loading subjects...' : 'Search a subject...'}
                disabled={disabled || isLoading}
                value={displayValue}
                onChange={handleInputChange}
                showClear={Boolean(value)}
                className="bg-background border-border/60 w-full transition-all focus:border-[#323d8f] focus:ring-2 focus:ring-[#323d8f]/20"
                onFocus={() => {
                    setOpen(true);
                    setDisplayValue(searchTerm);
                }}
            />
            <ComboboxContent className="bg-background border-border/60 w-full min-w-[280px] rounded-md border shadow-md">
                <ComboboxList className="max-h-60 overflow-y-auto p-1">
                    {filteredSubjects.map((subject) => {
                        const id = subject.id || subject.subject_id || '';
                        const code = subject.code || subject.subject_code || '';
                        const title = subject.title || subject.subject_title || '';
                        return (
                            <ComboboxItem key={id} value={id}>
                                <div className="flex flex-col text-left">
                                    <span className="text-foreground text-sm font-semibold">
                                        {code}
                                    </span>
                                    <span className="text-muted-foreground text-xs">{title}</span>
                                </div>
                            </ComboboxItem>
                        );
                    })}
                    {filteredSubjects.length === 0 && (
                        <ComboboxEmpty className="text-muted-foreground py-2 text-center text-xs">
                            {isLoading ? 'Loading subjects...' : 'No subjects found'}
                        </ComboboxEmpty>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
