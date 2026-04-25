'use client';

import { useState } from 'react';
import { useStableValue, useClassroomsQuery, useDebounce } from '@sentinel/hooks';
import { Button, PageHeader, Separator } from '@sentinel/ui';
import { UserPlus } from 'lucide-react';
import { ClassroomsList } from './_components/classrooms-list';
import { createClassroomColumns } from './_components/classroom-columns';
import { CreateClassroomDialog } from './_components/create-classroom-dialog';

export default function InstructorClassroomsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data: classrooms = [], isLoading } = useClassroomsQuery(debouncedSearch);

    const columns = useStableValue(() => createClassroomColumns(), []);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Classrooms"
                description="Create classrooms from approved offerings, manage rosters, and use them as the instructor-facing source of truth."
            >
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Classroom
                </Button>
            </PageHeader>
            <Separator />

            <ClassroomsList
                classrooms={classrooms}
                columns={columns}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onCreateClick={() => setIsCreateOpen(true)}
                isLoading={isLoading}
            />

            <CreateClassroomDialog
                open={isCreateOpen}
                onOpenChangeAction={setIsCreateOpen}
                configuredClassGroupIds={classrooms.map((classroom) => classroom.id)}
            />
        </div>
    );
}
