'use client';

import {
    DataTable,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { studentColumns } from '@/app/(protected)/(instructor)/exams/grading/_components/student-columns';
import { GradingStudent } from '@sentinel/shared/types';

interface GradingStudentListProps {
    data: GradingStudent[];
    isLoading?: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    sectionId?: string;
    onSectionChange: (sectionId?: string) => void;
    sections: {
        id: string;
        name: string;
    }[];
    isSectionsLoading?: boolean;
}

export function GradingStudentList({
    data,
    isLoading,
    searchValue,
    onSearchChange,
    sectionId,
    onSectionChange,
    sections,
    isSectionsLoading,
}: GradingStudentListProps) {
    const filterAction = (
        <Select
            value={sectionId || 'all'}
            onValueChange={(value) => onSectionChange(value === 'all' ? undefined : value)}
        >
            <SelectTrigger className="w-[200px]">
                <SelectValue
                    placeholder={isSectionsLoading ? 'Loading sections...' : 'All Sections'}
                />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                        {section.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <DataTable
            columns={studentColumns}
            data={data}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            searchPlaceholder="Filter students..."
            toolbarActions={filterAction}
            isLoading={isLoading}
        />
    );
}
