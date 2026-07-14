'use client';

import { useMemo } from 'react';
import { DataTable, type DataTableFacet } from '@sentinel/ui';
import { columns } from '@/app/(protected)/(instructor)/exams/grading/_components/columns';
import { useGradingList } from '@/app/(protected)/(instructor)/exams/grading/_hooks/use-grading-list';

export function GradingList() {
    const { exams, isLoading } = useGradingList();

    const availableSections = useMemo(() => {
        const sectionsMap = new Map<string, string>();
        exams.forEach((exam) => {
            if (exam.sectionIds && exam.sectionNames) {
                exam.sectionIds.forEach((id, index) => {
                    const name = exam.sectionNames[index];
                    if (name) {
                        sectionsMap.set(id, name);
                    }
                });
            }
        });
        return Array.from(sectionsMap.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [exams]);

    const sectionFacet = useMemo<DataTableFacet>(
        () => ({
            columnKey: 'sectionName',
            title: 'Section',
            options: availableSections.map((s) => ({
                label: s.name,
                value: s.name,
            })),
        }),
        [availableSections],
    );

    return (
        <DataTable
            columns={columns}
            data={exams}
            searchKey="title"
            searchPlaceholder="Filter exams..."
            isLoading={isLoading}
            facets={[sectionFacet]}
            initialColumnVisibility={{ sectionName: false }}
        />
    );
}
