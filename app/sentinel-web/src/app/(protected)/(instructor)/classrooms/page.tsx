'use client';

import { useState } from 'react';
import { useStableValue, useClassroomsQuery, useDebounce } from '@sentinel/hooks';
import { Button, PageHeader, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from '@sentinel/ui';
import { UserPlus } from 'lucide-react';
import { ClassroomsList } from './_components/classrooms-list';
import { createClassroomColumns } from './_components/classroom-columns';
import { CreateClassroomDialog } from './_components/create-classroom-dialog';

export default function InstructorClassroomsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    const { data: classrooms = [], isLoading } = useClassroomsQuery({
        search: debouncedSearch,
        status: activeTab,
    });

    const columns = useStableValue(() => createClassroomColumns(), []);

    return (
        <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'active' | 'archived')}
            className="flex flex-col gap-6 p-4 md:p-6"
        >
            <PageHeader
                title="Classrooms"
                description="Create classrooms from approved offerings, manage rosters, and use them as the instructor-facing source of truth."
            >
                <div className="flex items-center gap-3">
                    <TabsList className="grid w-40 grid-cols-2">
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="archived">Archived</TabsTrigger>
                    </TabsList>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Classroom
                    </Button>
                </div>
            </PageHeader>
            <Separator />

            <TabsContent value="active" className="m-0">
                <ClassroomsList
                    classrooms={classrooms}
                    columns={columns}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onCreateClick={() => setIsCreateOpen(true)}
                    isLoading={isLoading}
                />
            </TabsContent>

            <TabsContent value="archived" className="m-0">
                <ClassroomsList
                    classrooms={classrooms}
                    columns={columns}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onCreateClick={() => setIsCreateOpen(true)}
                    isLoading={isLoading}
                />
            </TabsContent>

            <CreateClassroomDialog
                open={isCreateOpen}
                onOpenChangeAction={setIsCreateOpen}
                configuredClassGroupIds={classrooms.map((classroom) => classroom.id)}
            />
        </Tabs>
    );
}

