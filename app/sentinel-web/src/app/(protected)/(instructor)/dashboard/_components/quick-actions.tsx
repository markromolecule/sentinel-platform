'use client';

import Link from 'next/link';
import { Card } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Plus, Users, BookOpen, UserCheck } from 'lucide-react';

export function QuickActions() {
    return (
        <Card className="border-border/50 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
                <Button
                    asChild
                    className="h-auto flex-col gap-2 bg-[#323d8f] py-4 hover:bg-[#323d8f]/90"
                >
                    <Link href="/exams">
                        <Plus className="h-5 w-5" />
                        <span>Create Exam</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                    <Link href="/students">
                        <Users className="h-5 w-5" />
                        <span>Add Students</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                    <Link href="/subjects">
                        <BookOpen className="h-5 w-5" />
                        <span>Add Subject</span>
                    </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                    <Link href="/assignment">
                        <UserCheck className="h-5 w-5" />
                        <span>Assign Instructor</span>
                    </Link>
                </Button>
            </div>
        </Card>
    );
}
