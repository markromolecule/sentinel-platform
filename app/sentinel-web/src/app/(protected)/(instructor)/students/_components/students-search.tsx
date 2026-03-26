"use client";

import { SearchBar } from "@sentinel/ui";
import { StudentsSearchProps } from '@sentinel/shared/types';

export function StudentsSearch({ searchQuery, onSearchChange }: StudentsSearchProps) {
    return (
        <SearchBar
            placeholder="Search by name, student no., section..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-md"
        />
    );
}
