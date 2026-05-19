'use client';

import { useState } from 'react';
import { useStableValue, useClassroomsQuery, useDebounce, isPermissionDeniedError } from '@sentinel/hooks';
import { Button, PageHeader, Separator, PermissionDeniedState } from '@sentinel/ui';
import { UserPlus } from 'lucide-react';
import { ClassroomsList } from './_components/classrooms-list';
import { createClassroomColumns } from './_components/classroom-columns';
import { CreateClassroomDialog } from './_components/create-classroom-dialog';
import { PermissionGate } from '@/features/administration/shared/permission-gate';

export function ClassroomsPage() {
    const [searchTermForInput, setSearchTermForInput] = useState('');
    const debouncedSearch = useDebounce(searchTermForInput, 500);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data: classrooms = [], isLoading, error } = useClassroomsQuery(debouncedSearch);

    const isClassroomsViewDenied = isPermissionDeniedError(error, 'classrooms:view');
    const columns = useStableValue(() => createClassroomColumns(), []);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Classrooms"
                description="Manage classrooms, assign teaching access, control rosters, and monitor student enrollment."
            >
                {!isClassroomsViewDenied && (
                    <PermissionGate permission="classrooms" action="edit">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create Classroom
                        </Button>
                    </PermissionGate>
                )}
            </PageHeader>
            <Separator />

            {isClassroomsViewDenied ? (
                <PermissionDeniedState resourceName="classrooms" className="h-[360px]" />
            ) : (
                <ClassroomsList
                    classrooms={classrooms}
                    columns={columns}
                    searchTerm={searchTermForInput}
                    onSearchChange={setSearchTermForInput}
                    onCreateClick={() => setIsCreateOpen(true)}
                    isLoading={isLoading}
                />
            )}

            {!isClassroomsViewDenied && (
                <CreateClassroomDialog
                    open={isCreateOpen}
                    onOpenChangeAction={setIsCreateOpen}
                    configuredClassGroupIds={classrooms.map((classroom) => classroom.id)}
                />
            )}
        </div>
    );
}
