'use client';

import Link from 'next/link';
import { Button } from '@sentinel/ui';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { MonitoringHeaderProps } from '@sentinel/shared/types';

export function MonitoringHeader({ examTitle, examSubject }: MonitoringHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
                <Link href="/exams">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div className="flex-1">
                <h1 className="text-foreground text-2xl font-bold">{examTitle}</h1>
                <p className="text-muted-foreground text-sm">Live Monitoring • {examSubject}</p>
            </div>
            <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
            </Button>
        </div>
    );
}
