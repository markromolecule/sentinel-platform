'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@sentinel/ui';
import StudentHeader from '@/components/sidebar/student/StudentHeader';
import StudentBottomNav from '@/components/sidebar/student/StudentBottomNav';
import StudentFooter from '@/components/sidebar/student/StudentFooter';
import { PageShell } from '@/components/common';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isExamFlowPage =
        pathname?.startsWith('/student/exam/') && !/^\/student\/exam\/?$/.test(pathname);

    const isMessages = pathname === '/student/message';

    if (isExamFlowPage) {
        return (
            <div className="bg-background text-foreground flex min-h-screen flex-col">
                <main className="w-full flex-1">{children}</main>
            </div>
        );
    }

    return (
        <div className={cn(
            "bg-background text-foreground flex min-h-screen flex-col pb-20 md:pb-0",
            isMessages && "h-screen !min-h-0 overflow-hidden"
        )}>
            <StudentHeader />
            <main className={cn("flex-1", isMessages ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "")}>
                <PageShell
                    maxWidth={isMessages ? "full" : "2xl"}
                    container={!isMessages}
                    className={cn(isMessages ? "flex-1 min-h-0 overflow-hidden gap-0 p-0" : "")}
                >
                    {children}
                </PageShell>
            </main>
            <StudentFooter />
            <StudentBottomNav />
        </div>
    );
}
