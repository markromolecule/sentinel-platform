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
import { type User } from '@sentinel/services';
import { useUserSearch } from '@sentinel/hooks';

export interface RowInstructorComboboxProps {
    value: string;
    onValueChange: (value: string) => void;
    users: User[];
    disabled?: boolean;
}

/**
 * RowInstructorCombobox provides a searchable and clearable instructor selection field.
 */
export function RowInstructorCombobox({
    value,
    onValueChange,
    users,
    disabled = false,
}: RowInstructorComboboxProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [open, setOpen] = React.useState(false);

    // Call the server-side search hook
    const { users: searchedUsers, isLoading: isSearchLoading } = useUserSearch(searchTerm, {
        role: ['instructor'],
    });

    // Find the currently selected instructor to show their name
    const selectedInstructor = React.useMemo(() => {
        if (!value || value === 'none') return null;
        // Search in initial list first
        const found = users.find((u) => u.id === value);
        if (found) return found;
        // Search in the dynamic backend search results
        return searchedUsers.find((u) => u.id === value) || null;
    }, [users, searchedUsers, value]);

    // Format display name
    const selectedName = React.useMemo(() => {
        if (!selectedInstructor) return 'No instructor';
        return (
            [selectedInstructor.firstName, selectedInstructor.lastName].filter(Boolean).join(' ') ||
            selectedInstructor.email
        );
    }, [selectedInstructor]);

    // Track what is currently displayed in the input field
    const [displayValue, setDisplayValue] = React.useState('No instructor');

    // Synchronize display value with selection when dropdown is closed/opened
    React.useEffect(() => {
        if (!open) {
            setDisplayValue(selectedName);
            setSearchTerm('');
        }
    }, [open, selectedName]);

    // Filter list client-side based on typing when searchTerm < 2, or use server-side results when searchTerm >= 2
    const filteredUsers = React.useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (term.length < 2) {
            if (!term) return users;
            return users.filter((user) => {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
                const email = (user.email || '').toLowerCase();
                return fullName.includes(term) || email.includes(term);
            });
        }
        return searchedUsers;
    }, [users, searchedUsers, searchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDisplayValue(val);
        setSearchTerm(val);

        // If user clears the input completely, clear the selected instructor (set to 'none')
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
                placeholder="Search instructor..."
                disabled={disabled}
                value={displayValue}
                onChange={handleInputChange}
                showClear={value !== 'none'}
                className="w-full bg-white dark:bg-zinc-950"
                onFocus={() => {
                    setOpen(true);
                    // Clear display value to show all options on focus, or keep search term if any
                    setDisplayValue(searchTerm);
                }}
            />
            <ComboboxContent className="w-full min-w-[240px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-md">
                <ComboboxList className="max-h-60 overflow-y-auto p-1">
                    <ComboboxItem value="none">
                        <span className="text-zinc-500 italic">No instructor</span>
                    </ComboboxItem>
                    {filteredUsers.map((user) => {
                        const name =
                            [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                            user.email;
                        return (
                            <ComboboxItem key={user.id} value={user.id}>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {name}
                                    </span>
                                    {user.firstName && (
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {user.email}
                                        </span>
                                    )}
                                </div>
                            </ComboboxItem>
                        );
                    })}
                    {filteredUsers.length === 0 && (
                        <ComboboxEmpty className="py-2 text-center text-xs text-zinc-500">
                            {isSearchLoading ? 'Loading instructors...' : 'No instructors found'}
                        </ComboboxEmpty>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
