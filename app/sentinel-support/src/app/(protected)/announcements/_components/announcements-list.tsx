'use client';

import { DataTable } from '@sentinel/ui';
import { columns } from './columns';
import { Announcement } from '@sentinel/shared/types';

interface AnnouncementsListProps {
    announcements: Announcement[];
}

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
    return (
        <DataTable
            columns={columns}
            data={announcements}
            searchKey="title"
            searchPlaceholder="Search announcements..."
            facets={[
                {
                    columnKey: 'status',
                    title: 'Status',
                    options: [
                        { label: 'Draft', value: 'draft' },
                        { label: 'Published', value: 'published' },
                        { label: 'Archived', value: 'archived' },
                    ],
                },
                {
                    columnKey: 'targetAudience',
                    title: 'Target Audience',
                    options: [
                        { label: 'All', value: 'all' },
                        { label: 'Students', value: 'students' },
                        { label: 'Proctors', value: 'proctors' },
                        { label: 'Instructors', value: 'instructors' },
                    ],
                },
            ]}
        />
    );
}
