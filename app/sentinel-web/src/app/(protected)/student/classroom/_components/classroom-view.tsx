'use client';

import { useState } from 'react';
import { useStudentClassroomsQuery } from '@sentinel/hooks';
import { ExamHeader } from '../../exam/_components/exam-header';
import { ClassroomGrid } from './classroom-grid';
import { Input } from '@sentinel/ui';
import { Search } from 'lucide-react';
import { Skeleton } from '@sentinel/ui';

export function ClassroomView() {
    const [search, setSearch] = useState('');
    const { data: classrooms, isLoading, error } = useStudentClassroomsQuery();

    const filteredClassrooms = classrooms?.filter(
        (c) =>
            c.subjectTitle.toLowerCase().includes(search.toLowerCase()) ||
            c.subjectCode.toLowerCase().includes(search.toLowerCase()),
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="font-medium text-red-500">Failed to load classrooms</p>
                <p className="text-muted-foreground mt-1 text-sm">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-5 py-5 duration-500">
            <ExamHeader />

            {/* Search Bar - Reverted to Exam Search Style */}
            <div className="group relative w-full max-w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="text-muted-foreground group-focus-within:text-primary h-5 w-5 transition-colors" />
                </div>
                <Input
                    type="text"
                    placeholder="Search your subjects or codes..."
                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-14 rounded-none pl-11 text-lg transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-none" />
                        </div>
                    ))}
                </div>
            ) : (
                <ClassroomGrid
                    classrooms={filteredClassrooms || []}
                    emptyMessage={
                        search
                            ? `No results found for "${search}"`
                            : "You don't have any classrooms yet."
                    }
                />
            )}
        </div>
    );
}
