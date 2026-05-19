import { ClassroomDetailPage } from '@/features/administration/classrooms/classroom-detail-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Classroom Details | Sentinel',
    description: 'View classroom scope, manage teaching access, and monitor student roster.',
};

export default function Page() {
    return <ClassroomDetailPage />;
}
