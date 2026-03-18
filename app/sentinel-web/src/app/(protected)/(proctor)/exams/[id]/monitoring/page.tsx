"use client";

import { useState, useMemo } from "react";
import { StudentSession, ViewMode } from '@sentinel/shared/types';
import { MOCK_EXAM, MOCK_MONITORING_STUDENTS as MOCK_STUDENTS } from '@sentinel/shared/constants';
import {
    MonitoringHeader,
    MonitoringStats,
    StudentList,
    MonitoringDetailPanel
} from "@/features/exams";
import { cn } from "@sentinel/ui";

export default function ExamMonitoringPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<StudentSession | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("detail");
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
            <div className={cn(
                "grid gap-6",
                viewMode === "detail" ? "lg:grid-cols-3" : "grid-cols-1"
            )}>
                {/* Student List */}
                <StudentList
                    students={filteredStudents}
                    selectedId={selectedStudent?.id || null}
                    onSelect={(s) => {
                        setSelectedStudent(s);
                    }}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    filterStatus={filterStatus}
                    onFilterChange={handleFilterChange}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    page={page}
                    pageSize={pageSize}
                    totalCount={filteredStudents.length}
                    onPageChange={setPage}
                />

                {/* Detail Panel - Only show in detail mode */}
                {viewMode === "detail" && (
                    <div className="lg:col-span-1">
                        <MonitoringDetailPanel student={selectedStudent} />
                    </div>
                )}
            </div>
        </div>
    );
}
