import { CoursesPage } from '@/features/administration/courses/courses-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Course Management | Sentinel',
    description: 'Manage academic programs and courses.',
};

export default function Page() {
    return <CoursesPage />;
}
