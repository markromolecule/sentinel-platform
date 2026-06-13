'use client';

import { useMemo, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    DataTable,
} from '@sentinel/ui';
import { columns } from '@/app/(protected)/exams/grading/_components/columns';
import { useGradingList } from '@/app/(protected)/exams/grading/_hooks/use-grading-list';
import { useSectionsQuery } from '@sentinel/hooks';

export function GradingList() {
    const [sectionId, setSectionId] = useState<string | undefined>();
    const { exams, isLoading } = useGradingList(sectionId);
    const { data: sections = [], isLoading: isSectionsLoading } = useSectionsQuery();
    const sectionOptions = useMemo(
        () =>
            sections
                .map((section) => ({
                    id: section.id,
                    name: section.name,
                }))
                .sort((left, right) => left.name.localeCompare(right.name)),
        [sections],
    );

    const filterAction = (
        <Select
            value={sectionId || 'all'}
            onValueChange={(val) => setSectionId(val === 'all' ? undefined : val)}
        >
            <SelectTrigger className="w-[200px]">
                <SelectValue
                    placeholder={isSectionsLoading ? 'Loading sections...' : 'All Sections'}
                />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sectionOptions.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                        {section.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <DataTable
            columns={columns}
            data={exams}
            searchKey="title"
            searchPlaceholder="Filter exams..."
            toolbarActions={filterAction}
            isLoading={isLoading}
        />
    );
}
