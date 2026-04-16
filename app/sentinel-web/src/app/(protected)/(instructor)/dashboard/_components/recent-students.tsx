'use client';

import Link from 'next/link';
import { Card } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { ArrowRight } from 'lucide-react';
import { RecentStudentsProps } from '@sentinel/shared/types';

export function RecentStudents({ students }: RecentStudentsProps) {
    return (
        <Card className="border-border/50 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-semibold">Recent Students</h2>
                <Button asChild variant="ghost" size="sm" className="text-[#323d8f]">
                    <Link href="/students">
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="space-y-3">
                {students.map((student) => (
                    <div
                        key={student.id}
                        className="bg-muted/50 hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#323d8f] to-[#4a5bb8] text-xs font-bold text-white">
                                {student.firstName[0]}
                                {student.lastName[0]}
                            </div>
                            <div>
                                <p className="text-foreground text-sm font-medium">
                                    {student.firstName} {student.lastName}
                                </p>
                                <p className="text-muted-foreground text-xs">{student.studentNo}</p>
                            </div>
                        </div>
                        <span className="text-muted-foreground text-xs">{student.section}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
