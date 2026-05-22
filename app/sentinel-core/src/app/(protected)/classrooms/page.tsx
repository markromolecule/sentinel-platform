import { ClassroomsPage } from '@/features/administration/classrooms/classrooms-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Classroom Management | Sentinel',
    description:
        'Manage classrooms, assign teaching access, control rosters, and monitor student enrollment.',
};

export default function Page() {
    return <ClassroomsPage />;
}
