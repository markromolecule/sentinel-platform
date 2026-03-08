"use client";

import { Search } from "lucide-react";
import { Input } from "@sentinel/ui";
import { StudentsSearchProps } from '@sentinel/shared/types';;

export function StudentsSearch({ searchQuery, onSearchChange }: StudentsSearchProps) {
    return (
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                placeholder="Search by name, student no., section..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
            />
        </div>
    );
}
