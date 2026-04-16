'use client';

import { DataTable } from '@sentinel/ui';
import { type ProctorExam } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(admin)/exams/_components/columns';
import { examFacets } from '@/app/(protected)/(admin)/exams/_components/exam-facets';

interface ExamsListProps {
    exams: ProctorExam[];
}

export function ExamsList({ exams }: ExamsListProps) {
    return (
        <DataTable
            columns={columns}
            data={exams}
            searchKey="title"
            searchPlaceholder="Search exams..."
            facets={examFacets}
        />
    );
}
