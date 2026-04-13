"use client";

import { usePathname } from "next/navigation";
import StudentHeader from "@/components/sidebar/student/StudentHeader";
import StudentBottomNav from "@/components/sidebar/student/StudentBottomNav";
import StudentFooter from "@/components/sidebar/student/StudentFooter";
import { PageShell } from "@/components/common";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isExamPage = pathname?.includes("/monitoring") || pathname?.includes("/configuration");

    if (isExamPage) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
            <StudentHeader />
            <main className="flex-1">
                <PageShell maxWidth="2xl">
                    {children}
                </PageShell>
            </main>
            <StudentFooter />
            <StudentBottomNav />
        </div>
    );
}
