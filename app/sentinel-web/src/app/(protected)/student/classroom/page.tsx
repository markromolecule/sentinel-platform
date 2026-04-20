import { Metadata } from 'next';
import { ClassroomView } from './_components/classroom-view';

export const metadata: Metadata = {
    title: 'My Classrooms | Sentinel',
    description: 'Manage your enrolled subjects and sections.',
};

export default function StudentClassroomPage() {
    return <ClassroomView />;
}
