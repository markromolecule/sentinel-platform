'use client';

import { usePathname } from 'next/navigation';
import StudentHeader from '@/components/sidebar/student/StudentHeader';
import StudentBottomNav from '@/components/sidebar/student/StudentBottomNav';
import StudentFooter from '@/components/sidebar/student/StudentFooter';
import { PageShell } from '@/components/common';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isExamFlowPage =
        pathname?.startsWith('/student/exam/') && !/^\/student\/exam\/?$/.test(pathname);

    if (isExamFlowPage) {
        return (
            <div className="bg-background text-foreground flex min-h-screen flex-col">
                <main className="w-full flex-1">{children}</main>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col pb-20 md:pb-0">
            <StudentHeader />
            <main className="flex-1">
                <PageShell maxWidth="2xl">{children}</PageShell>
            </main>
            <StudentFooter />
            <StudentBottomNav />
        </div>
    );
}
