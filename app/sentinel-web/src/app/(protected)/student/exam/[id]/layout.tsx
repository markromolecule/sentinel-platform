import type { ReactNode } from 'react';
import { StudentExamMediaPipeProvider } from './_components/student-exam-mediapipe-provider';

export default function StudentExamLayout({ children }: { children: ReactNode }) {
    return <StudentExamMediaPipeProvider>{children}</StudentExamMediaPipeProvider>;
}
