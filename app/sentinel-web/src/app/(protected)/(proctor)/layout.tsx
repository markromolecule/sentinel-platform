import { Suspense } from "react";
import { ProctorLayoutClient } from "@/app/(protected)/(proctor)/_components/proctor-layout-client";

export default function ProctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading layout...</div>}>
            <ProctorLayoutClient>{children}</ProctorLayoutClient>
        </Suspense>
    );
}
