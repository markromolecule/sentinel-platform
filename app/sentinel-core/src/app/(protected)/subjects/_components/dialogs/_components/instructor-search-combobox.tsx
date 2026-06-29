'use client';

import * as React from 'react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from '@sentinel/ui';

interface InstructorSearchComboboxProps {
    value: string | null;
    displayValue: string;
    searchTerm: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    searchedInstructors: any[];
    isSearchLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onSelect: (val: string | null) => void;
}

/**
 * Combobox input selector specifically styled for instructor profiles.
 */
export function InstructorSearchCombobox({
    value,
    displayValue,
    searchTerm,
    open,
    onOpenChange,
    searchedInstructors,
    isSearchLoading,
    onInputChange,
    onFocus,
    onSelect,
}: InstructorSearchComboboxProps) {
    return (
        <Combobox
            value={value}
            onValueChange={onSelect}
            open={open}
            onOpenChange={onOpenChange}
            filter={null}
        >
            <div className="relative">
                <ComboboxInput
                    placeholder="Type at least 2 characters to search..."
                    value={displayValue}
                    onChange={onInputChange}
                    showClear={!!value}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onFocus={onFocus}
                />
            </div>
            <ComboboxContent className="w-[380px] z-50 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                <ComboboxList className="max-h-60 overflow-y-auto p-1">
                    {searchedInstructors.map((user) => {
                        const name =
                            [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                            user.email;
                        return (
                            <ComboboxItem
                                key={user.id}
                                value={user.id}
                                className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded p-2"
                            >
                                <div className="flex items-center gap-2 text-left">
                                    <Avatar className="h-8 w-8 border border-border">
                                        <AvatarImage src={user.avatarUrl ?? ''} alt={name} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'I'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            {name}
                                        </span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                            </ComboboxItem>
                        );
                    })}
                    {searchedInstructors.length === 0 && (
                        <ComboboxEmpty className="py-4 text-center text-xs text-zinc-500">
                            {isSearchLoading
                                ? 'Searching...'
                                : searchTerm.length < 2
                                  ? 'Type at least 2 characters to search'
                                  : 'No instructors found'}
                        </ComboboxEmpty>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
