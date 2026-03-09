"use client";

import { useId, useMemo, useState } from "react";
import { Checkbox } from "@sentinel/ui";
import { FormLabel } from "@sentinel/ui";
import { Input } from "@sentinel/ui";

export interface FilterableCheckboxOption {
    value: string;
    label: string;
}

interface FilterableCheckboxGroupProps {
    title: string;
    searchPlaceholder: string;
    emptyMessage: string;
    options: FilterableCheckboxOption[];
    selectedValues: string[];
    onToggle: (value: string) => void;
    helperText?: string;
    visibleRows?: number;
}

const DEFAULT_VISIBLE_ROWS = 3;
const ROW_HEIGHT_PX = 30;
const LIST_VERTICAL_PADDING_PX = 8;

export function FilterableCheckboxGroup({
    title,
    searchPlaceholder,
    emptyMessage,
    options,
    selectedValues,
    onToggle,
    helperText,
    visibleRows = DEFAULT_VISIBLE_ROWS,
}: FilterableCheckboxGroupProps) {
    const [search, setSearch] = useState("");
    const groupId = useId();

    const filteredOptions = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return options;
        }

        return options.filter((option) => option.label.toLowerCase().includes(query));
    }, [options, search]);

    const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
    const listHeight = visibleRows * ROW_HEIGHT_PX + LIST_VERTICAL_PADDING_PX * 2;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <FormLabel className="text-base">{title}</FormLabel>
                <span className="text-xs text-muted-foreground">
                    {selectedValues.length} selected
                </span>
            </div>

            <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9"
            />

            <div
                className="w-full overflow-y-auto rounded-md border px-3 py-2"
                style={{ height: `${listHeight}px` }}
            >
                <div className="space-y-2">
                    {filteredOptions.map((option) => {
                        const optionId = `${groupId}-${option.value.replace(/[^a-zA-Z0-9-_]/g, "-")}`;

                        return (
                            <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={optionId}
                                    checked={selectedSet.has(option.value)}
                                    onCheckedChange={() => onToggle(option.value)}
                                />
                                <label
                                    htmlFor={optionId}
                                    className="text-sm font-medium leading-none"
                                >
                                    {option.label}
                                </label>
                            </div>
                        );
                    })}

                    {filteredOptions.length === 0 && (
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    )}
                </div>
            </div>

            {helperText && <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>}
        </div>
    );
}
