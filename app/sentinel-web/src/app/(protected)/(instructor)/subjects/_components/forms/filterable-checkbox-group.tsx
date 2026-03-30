"use client";

import { useId, useMemo, useState } from "react";
import { Checkbox, FormLabel, SearchBar } from "@sentinel/ui";
import { DEFAULT_VISIBLE_ROWS, ROW_HEIGHT_PX, LIST_VERTICAL_PADDING_PX } from "@/app/(protected)/(instructor)/subjects/_components/forms/_constants";
import { type FilterableCheckboxGroupProps } from "@/app/(protected)/(instructor)/subjects/_components/forms/_types";

export function FilterableCheckboxGroup({
    title,
    searchPlaceholder,
    emptyMessage,
    options,
    selectedValues,
    onToggle,
    onToggleAll,
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

    const allFilteredAreSelected = useMemo(() => {
        if (filteredOptions.length === 0) return false;
        return filteredOptions.every(opt => selectedSet.has(opt.value));
    }, [filteredOptions, selectedSet]);

    const listHeight = visibleRows * ROW_HEIGHT_PX + LIST_VERTICAL_PADDING_PX * 2;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                    <FormLabel className="text-base">{title}</FormLabel>
                    {onToggleAll && filteredOptions.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onToggleAll(filteredOptions.map(opt => opt.value), !allFilteredAreSelected)}
                            className="text-xs font-medium text-[#323d8f] hover:underline"
                        >
                            {allFilteredAreSelected ? "Deselect All" : "Select All"}
                            {search && " (Filtered)"}
                        </button>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">
                    {selectedValues.length} selected
                </span>
            </div>

            <SearchBar
                value={search}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9"
            />

            <div
                className="w-full overflow-y-auto rounded-md border px-3 py-2"
                style={{ height: `${listHeight}px` }}
            >
                <div className="space-y-2">
                    {filteredOptions.length > 0 ? filteredOptions.map((option) => {
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
                                    className="text-sm font-medium leading-none cursor-pointer"
                                >
                                    {option.label}
                                </label>
                            </div>
                        );
                    }) : (
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    )}
                </div>
            </div>

            {helperText && <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>}
        </div>
    );
}
