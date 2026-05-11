import type { ReactNode } from 'react';
import { StudentExamMediaPipeProvider } from './_components/student-exam-mediapipe-provider';
import { StudentExamAudioProvider } from './_components/student-exam-audio-provider';

export default function StudentExamLayout({ children }: { children: ReactNode }) {
    return (
        <StudentExamAudioProvider>
            <StudentExamMediaPipeProvider>{children}</StudentExamMediaPipeProvider>
        </StudentExamAudioProvider>
    );
}
