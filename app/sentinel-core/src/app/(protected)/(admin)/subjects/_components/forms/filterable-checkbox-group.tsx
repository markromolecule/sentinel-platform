'use client';

import { type KeyboardEvent, type WheelEvent, useId, useMemo, useState } from 'react';
import { Button, Checkbox, SearchBar } from '@sentinel/ui';
import { SelectionPanelHeader } from '@/app/(protected)/(admin)/subjects/_components/forms/selection-panel-header';

export interface FilterableCheckboxOption {
    value: string;
    label: string;
}

interface FilterableCheckboxGroupProps {
    title: string;
    searchPlaceholder?: string;
    emptyMessage: string;
    options: FilterableCheckboxOption[];
    selectedValues: string[];
    onToggle: (value: string) => void;
    helperText?: string;
    selectionSummary?: string;
    visibleRows?: number;
    disabled?: boolean;
    showSearch?: boolean;
    onSetSelectedValues?: (values: string[]) => void;
}

const DEFAULT_VISIBLE_ROWS = 2;
const ROW_HEIGHT_PX = 26;
const LIST_VERTICAL_PADDING_PX = 6;

export function FilterableCheckboxGroup({
    title,
    searchPlaceholder,
    emptyMessage,
    options,
    selectedValues,
    onToggle,
    helperText,
    selectionSummary,
    visibleRows = DEFAULT_VISIBLE_ROWS,
    disabled = false,
    showSearch = true,
    onSetSelectedValues,
}: FilterableCheckboxGroupProps) {
    const [search, setSearch] = useState('');
    const groupId = useId();

    const filteredOptions = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return options;
        }

        return options.filter((option) => option.label.toLowerCase().includes(query));
    }, [options, search]);

    const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
    const filteredValueSet = useMemo(
        () => new Set(filteredOptions.map((option) => option.value)),
        [filteredOptions],
    );
    const viewportRows =
        filteredOptions.length === 0 ? 3 : Math.min(filteredOptions.length, visibleRows);
    const minListHeight = viewportRows * ROW_HEIGHT_PX + LIST_VERTICAL_PADDING_PX * 2;
    const allFilteredSelected =
        filteredOptions.length > 0 &&
        filteredOptions.every((option) => selectedSet.has(option.value));

    function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const { currentTarget, key } = event;

        switch (key) {
            case 'ArrowDown':
                event.preventDefault();
                currentTarget.scrollBy({ top: ROW_HEIGHT_PX });
                break;
            case 'ArrowUp':
                event.preventDefault();
                currentTarget.scrollBy({ top: -ROW_HEIGHT_PX });
                break;
            case 'PageDown':
                event.preventDefault();
                currentTarget.scrollBy({ top: currentTarget.clientHeight });
                break;
            case 'PageUp':
                event.preventDefault();
                currentTarget.scrollBy({ top: -currentTarget.clientHeight });
                break;
            case 'Home':
                event.preventDefault();
                currentTarget.scrollTo({ top: 0 });
                break;
            case 'End':
                event.preventDefault();
                currentTarget.scrollTo({ top: currentTarget.scrollHeight });
                break;
        }
    }

    function handleListWheel(event: WheelEvent<HTMLDivElement>) {
        const { currentTarget, deltaY } = event;

        if (currentTarget.scrollHeight <= currentTarget.clientHeight) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        currentTarget.scrollTop += deltaY;
    }

    function handleSelectAllToggle() {
        if (!onSetSelectedValues || filteredOptions.length === 0) {
            return;
        }

        if (allFilteredSelected) {
            onSetSelectedValues(selectedValues.filter((value) => !filteredValueSet.has(value)));
            return;
        }

        const nextValues = new Set(selectedValues);
        filteredOptions.forEach((option) => nextValues.add(option.value));
        onSetSelectedValues(Array.from(nextValues));
    }

    return (
        <div className="border-border/60 bg-background flex h-full min-h-[320px] flex-col rounded-xl border p-3">
            <SelectionPanelHeader
                title={title}
                selectedCount={selectedValues.length}
                helperText={helperText}
                selectionSummary={
                    selectionSummary ??
                    (selectedValues.length > 0
                        ? `${selectedValues.length} selected`
                        : 'Nothing selected yet')
                }
                headerActionSlot={
                    onSetSelectedValues ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            disabled={disabled || filteredOptions.length === 0}
                            className="h-auto px-1 py-0 text-[11px] font-medium text-[#323d8f] hover:bg-transparent hover:text-[#323d8f]/80"
                            onClick={handleSelectAllToggle}
                        >
                            {allFilteredSelected ? 'Clear All' : 'Select All'}
                        </Button>
                    ) : undefined
                }
                actionSlot={
                    showSearch ? (
                        <SearchBar
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={searchPlaceholder}
                            disabled={disabled}
                            containerClassName="relative z-10"
                            className="h-10 bg-transparent py-0 text-[13px] leading-none"
                        />
                    ) : undefined
                }
            />

            <div
                className="bg-muted/20 mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-lg border px-2.5 py-2 [scrollbar-gutter:stable] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#323d8f]/35"
                style={{ minHeight: `${minListHeight}px` }}
                tabIndex={0}
                onKeyDown={handleListKeyDown}
                onWheelCapture={handleListWheel}
                aria-label={`${title} options`}
            >
                <div className="space-y-1">
                    {filteredOptions.map((option) => {
                        const optionId = `${groupId}-${option.value.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

                        return (
                            <label
                                key={option.value}
                                htmlFor={optionId}
                                className="hover:bg-background/70 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors"
                            >
                                <Checkbox
                                    id={optionId}
                                    checked={selectedSet.has(option.value)}
                                    onCheckedChange={() => onToggle(option.value)}
                                    disabled={disabled}
                                />
                                <span
                                    className={`text-[13px] leading-5 ${
                                        disabled ? 'text-muted-foreground' : 'text-foreground'
                                    }`}
                                >
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}

                    {filteredOptions.length === 0 && (
                        <p className="text-muted-foreground py-2 text-sm">{emptyMessage}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
