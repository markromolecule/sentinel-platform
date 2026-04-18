'use client';

import { useProfileQuery } from '@sentinel/hooks';

export function ExamHeader() {
    const { profile } = useProfileQuery();
    const displayName = profile?.firstName ?? 'Student';

    return (
        <div className="space-y-2 py-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                <span className="bg-gradient-to-r from-[#323d8f] to-[#4a5bb8] bg-clip-text text-transparent">
                    Welcome back,
                </span>{' '}
                <span className="text-primary">{displayName}!</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg md:text-xl">
                Manage your exams and continue your learning journey.
            </p>
        </div>
    );
}
