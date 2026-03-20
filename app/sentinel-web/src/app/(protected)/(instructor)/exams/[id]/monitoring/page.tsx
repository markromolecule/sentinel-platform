"use client";

import { useState, useMemo } from "react";
import { StudentSession } from '@sentinel/shared/types';
import { MOCK_EXAM, MOCK_MONITORING_STUDENTS as MOCK_STUDENTS } from '@sentinel/shared/constants';
import {
    MonitoringHeader,
    MonitoringStats,
    StudentList
} from "@/features/exams";
import { useRouter, usePathname } from "next/navigation";

export default function ExamMonitoringPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<StudentSession | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const filteredStudents = useMemo(() => {
        return MOCK_STUDENTS.filter((student) => {
            const matchesSearch =
                student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.studentNo.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === "all" || student.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, filterStatus]);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1); // Reset to first page on search
    };

    const handleFilterChange = (val: string) => {
        setFilterStatus(val);
        setPage(1); // Reset to first page on filter
    };

    const stats = {
        total: MOCK_STUDENTS.length,
        active: MOCK_STUDENTS.filter((s) => s.status === "active").length,
        flagged: MOCK_STUDENTS.filter((s) => s.status === "flagged").length,
        submitted: MOCK_STUDENTS.filter((s) => s.status === "submitted").length,
    };

    return (
        <div className="space-y-6 flex flex-col min-h-full">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <MonitoringHeader
                    examTitle={MOCK_EXAM.title}
                    examSubject={MOCK_EXAM.subject}
                />

                {/* Stats Bar */}
                <MonitoringStats stats={stats} />
            </div>

            {/* Main Content */}
            <StudentList
                students={filteredStudents}
                selectedId={selectedStudent?.id || null}
                onSelect={(s) => {
                    setSelectedStudent(s);
                    router.push(`${pathname}/${s.id}`);
                }}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                filterStatus={filterStatus}
                onFilterChange={handleFilterChange}
                page={page}
                pageSize={pageSize}
                totalCount={filteredStudents.length}
                onPageChange={setPage}
            />
        </div>
    );
}
