'use client';

import { Button } from '@sentinel/ui';
import { UserPlus } from 'lucide-react';
import { StudentsPageHeaderProps } from '@sentinel/shared/types';

export function StudentsPageHeader({ onAddClick }: StudentsPageHeaderProps) {
    return (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 className="text-foreground text-3xl font-bold">Students</h1>
                <p className="text-muted-foreground">Manage and enroll students for your exams</p>
            </div>
            <Button onClick={onAddClick} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Students
            </Button>
        </div>
    );
}
