'use client';

import Link from 'next/link';
import { Card } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { ArrowRight, FileText } from 'lucide-react';
import { RecentExamsProps } from '@sentinel/shared/types';

export function RecentExams({ exams }: RecentExamsProps) {
    return (
        <Card className="border-border/50 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">Recent Exams</h2>
                <Button asChild variant="ghost" size="sm" className="text-[#323d8f]">
                    <Link href="/exams">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="space-y-3">
                {exams.map((exam) => (
                    <div
                        key={exam.id}
                        className="bg-muted/50 hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-background rounded-lg p-2">
                                <FileText className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-foreground text-sm font-medium">{exam.title}</p>
                                <p className="text-muted-foreground text-xs">{exam.subject}</p>
                            </div>
                        </div>
                        <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                exam.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : exam.status === 'draft'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
